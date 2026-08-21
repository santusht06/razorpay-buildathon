import logging
import asyncio
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
import uuid
from app.config import settings

logger = logging.getLogger(__name__)

class InMemoryCollection:

    def __init__(self, name: str):
        self.name = name
        self._data: Dict[str, Dict[str, Any]] = {}

    async def insert_one(self, doc: Dict[str, Any]):
        doc_copy = dict(doc)
        if "_id" not in doc_copy:
            doc_copy["_id"] = str(uuid.uuid4())
        self._data[str(doc_copy["_id"])] = doc_copy
        class InsertResult:
            inserted_id = doc_copy["_id"]
        return InsertResult()

    async def insert_many(self, docs: List[Dict[str, Any]]):
        ids = []
        for doc in docs:
            res = await self.insert_one(doc)
            ids.append(res.inserted_id)
        class InsertManyResult:
            inserted_ids = ids
        return InsertManyResult()

    async def find_one(self, filter_dict: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        for item in self._data.values():
            if self._matches(item, filter_dict):
                return dict(item)
        return None

    def find(self, filter_dict: Optional[Dict[str, Any]] = None):
        filter_dict = filter_dict or {}
        matched = []
        for item in self._data.values():
            if self._matches(item, filter_dict):
                matched.append(dict(item))
        
        class Cursor:
            def __init__(self, items):
                self._items = items
                self._sort_key = None
                self._sort_direction = -1
                self._limit_val = 0
                self._skip_val = 0

            def sort(self, key_or_list, direction=-1):
                if isinstance(key_or_list, list):
                    if key_or_list:
                        self._sort_key = key_or_list[0][0]
                        self._sort_direction = key_or_list[0][1]
                else:
                    self._sort_key = key_or_list
                    self._sort_direction = direction
                return self

            def skip(self, n: int):
                self._skip_val = n
                return self

            def limit(self, n: int):
                self._limit_val = n
                return self

            async def to_list(self, length: Optional[int] = None):
                items = list(self._items)
                if self._sort_key:
                    items.sort(
                        key=lambda x: x.get(self._sort_key) or "",
                        reverse=(self._sort_direction == -1)
                    )
                if self._skip_val:
                    items = items[self._skip_val:]
                if self._limit_val:
                    items = items[:self._limit_val]
                if length is not None:
                    items = items[:length]
                return items

            def __aiter__(self):
                self._iter_items = iter(self._items)
                return self

            async def __anext__(self):
                try:
                    return next(self._iter_items)
                except StopIteration:
                    raise StopAsyncIteration

        return Cursor(matched)

    async def update_one(self, filter_dict: Dict[str, Any], update_dict: Dict[str, Any], upsert: bool = False):
        target = await self.find_one(filter_dict)
        if not target:
            if upsert:
                new_doc = dict(filter_dict)
                if "$set" in update_dict:
                    new_doc.update(update_dict["$set"])
                if "$setOnInsert" in update_dict:
                    new_doc.update(update_dict["$setOnInsert"])
                await self.insert_one(new_doc)
                class UpsertResult:
                    modified_count = 1
                    matched_count = 0
                    upserted_id = new_doc.get("_id")
                return UpsertResult()
            class MissedResult:
                modified_count = 0
                matched_count = 0
            return MissedResult()

        key_id = str(target["_id"])
        item = self._data[key_id]

        if "$set" in update_dict:
            for k, v in update_dict["$set"].items():
                item[k] = v
        if "$inc" in update_dict:
            for k, v in update_dict["$inc"].items():
                item[k] = item.get(k, 0) + v
        if "$push" in update_dict:
            for k, v in update_dict["$push"].items():
                if k not in item or not isinstance(item[k], list):
                    item[k] = []
                item[k].append(v)

        class UpdateResult:
            modified_count = 1
            matched_count = 1
            upserted_id = None
        return UpdateResult()

    async def count_documents(self, filter_dict: Optional[Dict[str, Any]] = None) -> int:
        filter_dict = filter_dict or {}
        count = 0
        for item in self._data.values():
            if self._matches(item, filter_dict):
                count += 1
        return count

    async def delete_many(self, filter_dict: Dict[str, Any]):
        to_delete = []
        for key, item in self._data.items():
            if self._matches(item, filter_dict):
                to_delete.append(key)
        for key in to_delete:
            del self._data[key]
        class DeleteResult:
            deleted_count = len(to_delete)
        return DeleteResult()

    def _matches(self, item: Dict[str, Any], filter_dict: Dict[str, Any]) -> bool:
        if not filter_dict:
            return True
        for k, v in filter_dict.items():
            if k == "$or" and isinstance(v, list):
                if not any(self._matches(item, sub_f) for sub_f in v):
                    return False
                continue
            if k == "$and" and isinstance(v, list):
                if not all(self._matches(item, sub_f) for sub_f in v):
                    return False
                continue
            
            val = item.get(k)
            if isinstance(v, dict):
                if "$in" in v:
                    if val not in v["$in"]:
                        return False
                if "$gte" in v:
                    if val is None or val < v["$gte"]:
                        return False
                if "$lte" in v:
                    if val is None or val > v["$lte"]:
                        return False
                if "$ne" in v:
                    if val == v["$ne"]:
                        return False
            else:
                if val != v:
                    return False
        return True

class InMemoryDatabase:
    def __init__(self, name: str):
        self.name = name
        self._collections: Dict[str, InMemoryCollection] = {}

    def get_collection(self, name: str) -> InMemoryCollection:
        if name not in self._collections:
            self._collections[name] = InMemoryCollection(name)
        return self._collections[name]

    def __getitem__(self, name: str) -> InMemoryCollection:
        return self.get_collection(name)

class DatabaseManager:
    client = None
    db = None
    is_in_memory: bool = False

    @classmethod
    async def connect(cls):
        try:
            from motor.motor_asyncio import AsyncIOMotorClient
            cls.client = AsyncIOMotorClient(
                settings.MONGODB_URI,
                serverSelectionTimeoutMS=2000
            )
            # Ping database to test connection
            await cls.client.admin.command('ping')
            cls.db = cls.client[settings.MONGODB_DB_NAME]
            cls.is_in_memory = False
            logger.info(f"Connected to MongoDB at {settings.MONGODB_URI}")
        except Exception as e:
            logger.warning(f"MongoDB connection failed ({e}). Falling back to high-performance In-Memory Document Store.")
            cls.db = InMemoryDatabase(settings.MONGODB_DB_NAME)
            cls.is_in_memory = True

    @classmethod
    async def close(cls):
        if cls.client and not cls.is_in_memory:
            cls.client.close()

    @classmethod
    def get_collection(cls, collection_name: str):
        if cls.db is None:
            # Emergency lazy initialization
            cls.db = InMemoryDatabase(settings.MONGODB_DB_NAME)
            cls.is_in_memory = True
        return cls.db[collection_name]

# Helper shorthand
def db_col(name: str):
    return DatabaseManager.get_collection(name)
