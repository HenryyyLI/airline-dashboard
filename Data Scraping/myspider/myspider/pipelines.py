# Define your item pipelines here
#
# Don't forget to add your pipeline to the ITEM_PIPELINES setting
# See: https://docs.scrapy.org/en/latest/topics/item-pipeline.html

# useful for handling different item types with a single interface
from itemadapter import ItemAdapter
from myspider.items import *
from postgres_db import PostgresClient

class MyspiderPipeline:
    def __init__(self):
        self.db = None

    @classmethod
    def from_crawler(cls, crawler):
        pipe = cls()
        pipe.db = PostgresClient(crawler.settings.get('POSTGRES_DSN'))
        return pipe

    def process_item(self, item, spider):
        try:
            if isinstance(item, AirlineItem):
                self.db.insert_airline(item)
            elif isinstance(item, ReviewItem):
                self.db.insert_review(item)
        except Exception as e:
            spider.logger.error(f"PostgreSQL Insert Error: {e}")
        return item

    def close_spider(self, spider):
        if self.db:
            self.db.close()
