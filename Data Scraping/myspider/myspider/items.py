# Define here the models for your scraped items
#
# See documentation in:
# https://docs.scrapy.org/en/latest/topics/items.html

from scrapy import Item, Field

class AirlineItem(Item):
    name = Field()
    image = Field()
    reviewCount = Field()

class ReviewItem(Item):
    reviewId = Field()
    title = Field()
    score = Field()
    content = Field()
    verifiedType = Field()

    airlineName = Field()
    userName = Field()
    country = Field()
    dateReview = Field()

    aircraft = Field()
    typeOfTraveller = Field()
    seatType = Field()
    route = Field()
    dateFlown = Field()
    
    seatComfort = Field()
    cabinStaffService = Field()
    foodBeverages = Field()
    inflightEntertainment = Field()
    groundService = Field()
    wifiConnectivity = Field()
    valueForMoney = Field()
    recommended = Field()