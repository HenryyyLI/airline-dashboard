import scrapy
from pyquery import PyQuery as PQ
from myspider.items import *
import re
from urllib.parse import urljoin

BASE_URL = 'https://www.airlinequality.com'

class ReviewSpider(scrapy.Spider):
    name = "reviews"
    allowed_domains = ["airlinequality.com"]
    start_urls = ["https://www.airlinequality.com/review-pages/a-z-airline-reviews/"]

    def parse(self, response):
        doc = PQ(response.text)

        for a in doc('div[id^="a2z-ldr-"] ul li a').items():
            href = a.attr("href")
            if href and "airline-reviews" in href:
                url = urljoin(BASE_URL, href)
                yield scrapy.Request(url, callback=self.parse_airline, meta={"is_first_page": True})

    def parse_airline(self, response):
        doc = PQ(response.text)
        next_href = None

        if response.meta.get("is_first_page"):
            airline_item = AirlineItem()

            name = doc('div.review-info h1[itemprop="name"]').text().strip()
            img = doc('div.review-info div.logo img').attr("src") or ""
            review_text = doc('div.review-info div.review-count span[itemprop=reviewCount]').text().strip()
            review_count = int(review_text) if review_text.isdigit() else None

            airline_item["name"] = name
            airline_item["image"] = img
            airline_item["reviewCount"] = review_count

            yield airline_item
        
        airline_name = doc('div.review-info h1[itemprop="name"]').text().strip()

        for block in doc('article[itemprop="review"]').items():
            review_item = ReviewItem()
            data = self.parse_one_review(block)
            data["airlineName"] = airline_name
            review_item.update(data)
            yield review_item
    
        for a in doc("article.querylist-pagination ul li a").items():
            if a.text().strip() == ">>":
                next_href = a.attr("href")
                break

        if next_href:
            next_url = urljoin(BASE_URL, next_href)
            yield scrapy.Request(next_url, callback=self.parse_airline, meta={"is_first_page": False})

    def parse_one_review(self, block):
        data = {}
        mapping = {
            "Aircraft": "aircraft",
            "Type Of Traveller": "typeOfTraveller",
            "Seat Type": "seatType",
            "Route": "route",
            "Date Flown": "dateFlown",
            "Seat Comfort": "seatComfort",
            "Cabin Staff Service": "cabinStaffService",
            "Food & Beverages": "foodBeverages",
            "Inflight Entertainment": "inflightEntertainment",
            "Ground Service": "groundService",
            "Value For Money": "valueForMoney",
            "Wifi & Connectivity": "wifiConnectivity",
            "Recommended": "recommended",
        }

        class_attr = block.attr("class") or ""
        match = re.search(r"review-(\d+)", class_attr)
        data["reviewId"] = match.group(1) if match else ""

        data["title"] = block("h2.text_header").text().strip()
        data["userName"] = block("span[itemprop='name']").text().strip()
        data["dateReview"] = block("time[itemprop='datePublished']").attr("datetime") or None
        score_text = block("div.rating-10 span[itemprop='ratingValue']").text().strip()
        data["score"] = int(score_text) if score_text.isdigit() else None

        header_text = block("h3.text_sub_header").text().strip()
        user_country = re.search(r"\((.*?)\)", header_text)
        data["country"] = user_country.group(1) if user_country else ""

        raw_content = block("div.text_content[itemprop='reviewBody']").text().strip()
        if " | " in raw_content:
            parts = raw_content.split(" | ", 1)
            data["verifiedType"] = parts[0].strip()
            data["content"] = parts[1].strip()
        else:
            data["verifiedType"] = ""
            data["content"] = raw_content

        for tr in block("table.review-ratings tr").items():
            tds = list(tr("td").items())
            key_td = tds[0].text().strip()

            value_td = tds[1]
            if value_td.has_class("review-rating-stars"):
                filled = list(value_td("span.star.fill").items())
                value = len(filled)
            else:
                value = value_td.text().strip()

            field = mapping.get(key_td)
            data[field] = value
        
        return data