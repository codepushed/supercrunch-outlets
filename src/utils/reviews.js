const reviews = [
    {
      "name": "Utsav",
      "flatno": "B1204",
      "feedback": "The Food was good, and actually appreciate the quick delivery!",
      "gender": "male"
    },
    {
      "name": "Rupeshree",
      "flatno": "D705",
      "feedback": "The taste was really good. We liked it. will definitely reorder it",
      "gender": "female"
    },
    {
      "name": "Swara Funde",
      "flatno": "A1006",
      "feedback": "Yeahh ur food is amazing!!",
      "gender": "female"
    },
    {
      "name": "Aakash Shende",
      "flatno": "H708",
      "feedback": "Bohot Tasty Hai Bhai, Maja Aa gaya",
      "gender": "male"
    },
    {
      "name": "Saanvi",
      "flatno": "A601",
      "feedback": "The jeera mocktail was nice and tasty!! The rose mocktail tasted like I was actually eating a rose, which can be improved by rather having an artificial rose flavour and making the flavour less intense. Thanks for the quick service and satisfying our late night craving!! ♥️",
      "gender": "female"
    },
    {
      "name": "Nikhil Gade",
      "flatno": "C1403",
      "feedback": "The momos were an absolute delight! The wrappers were perfectly soft with just the right chewiness, and the filling was packed with flavor—clearly made with love and care. Each bite had that comforting homemade touch that you just can't replicate in restaurants. The chutney was the real star—spicy, tangy, and the perfect companion.",
      "gender": "male"
    },
    {
      "name": "Saanvi",
      "flatno": "A601",
      "feedback": "White sauce pasta is too yum♥️",
      "gender": "female"
    },
    {
      "name": "Amit Patil",
      "flatno": "H702",
      "feedback": "5 Star ⭐⭐⭐⭐⭐ Pulao was actually good I expected something very generic but received an authentic one. Home-made!. Momos and White Sauce Pasta both were fabulous. However momos were flat due to less filling I guess. But to be honest I didn't mind it cause both were awesome.",
      "gender": "male"
    },
    {
      "name": "Vyshnavi",
      "flatno": "G103",
      "feedback": "Thanks for the food. Its good (thumbs up)",
      "gender": "female"
    },
    {
      "name": "Tejaswini Telhande",
      "flatno": "D902",
      "feedback": "Both drinks were amazing ! Loved it, Definitely ordering again.",
      "gender": "female"
    },
    {
      "name": "Sanchit Malode",
      "flatno": "G806",
      "feedback": "5 star",
      "gender": "male"
    },
    {
      "name": "Utkarsh Rai",
      "flatno": "C404",
      "feedback": "The order was great, Delicious taste",
      "gender": "male"
    },
    {
      "name": "Utsav",
      "flatno": "B1204",
      "feedback": "The Food was good! Thank you for quick service",
      "gender": "male"
    },
    {
      "name": "Utkarsh Rai",
      "flatno": "C404",
      "feedback": "Corn Palak Creamy Veg Fried Rice was the highlight of the meal — rich, comforting, and full of flavor. The creaminess blended beautifully with the mild bitterness of palak (spinach) and the sweetness of corn, creating a well-balanced and satisfying dish. It’s a unique twist on traditional fried rice that I’d happily recommend to anyone looking for something both hearty and wholesome. The Crushed Ice Lemon Mocktail was refreshing and served chilled to perfection, making it a great companion to the meal. That said, it could benefit from a slightly more pronounced tang or zest to give it that extra punch — a touch more citrus or even a hint of mint might elevate it further. As for the Veg Pulav, it was fragrant and well-cooked, with the vegetables adding a nice crunch and freshness. However, it leaned a bit on the spicier side. While spice lovers may enjoy the kick, those with milder palates might find it slightly overpowering. A small adjustment in heat could help make it more universally appealing. Overall, a flavorful and satisfying experience with just a few tweaks that could elevate it even further. Looking forward to trying more from this kitchen",
      "gender": "male"
    },
    {
      "name": "Gulisha",
      "flatno": "A306",
      "feedback": "Mocktail was good. Thanks",
      "gender": "female"
    },
    {
      "name": "Aditya Chavan",
      "flatno": "A806",
      "feedback": "Heart",
      "gender": "male"
    },
    {
      "name": "Prashant Dewangan",
      "flatno": "A306",
      "feedback": "Yeah. Food was tasty. Thanks !!",
      "gender": "male"
    },
    {
      "name": "Pranav",
      "flatno": "D1401",
      "feedback": "It was nice... But pasta was sooo hot spicy",
      "gender": "male"
    },
    {
      "name": "Akradeep Mazumdar",
      "flatno": "H1006",
      "feedback": "Yup it was great, it's just that I like my drink a bit more sweet other then that pasta was great",
      "gender": "male"
    },
    {
      "name": "Akradeep Mazumdar",
      "flatno": "H1006",
      "feedback": "Ya it was great......Will order in future fr sure.",
      "gender": "male"
    },
    {
      "name": "Ayush Modak",
      "flatno": "A301",
      "feedback": "5 Star",
      "gender": "male"
    },
    {
      "name": "Manisha",
      "flatno": "A803",
      "feedback": "Thumbs up",
      "gender": "female"
    },
    {
      "name": "Saunak",
      "flatno": "G1101",
      "feedback": "Yeah very happy with the food",
      "gender": "male"
    },
    {
      "name": "Pravin",
      "flatno": "G205",
      "feedback": "Shahi tukda was good, The mocktail was amazing, pasta has very less sauce but the taste was good.",
      "gender": "male"
    },
    {
      "name": "Amit Patil",
      "flatno": "H702",
      "feedback": "5 Star, Loved the Paneer steam momos & chilled jeera mocktail",
      "gender": "male"
    },
    {
      "name": "Sanjay Kamble",
      "flatno": "G702",
      "feedback": "I referred your food to my friends, they literally love it.",
      "gender": "male"
    },
    {
      "name": "Amit Patil",
      "flatno": "H702",
      "feedback": "5 Star, Loved the Paneer steam momos & chilled jeera mocktail",
      "gender": "male"
    },
    {
      "name": "Sanjay Kamble",
      "flatno": "G702",
      "feedback": "I referred your food to my friends, they literally love it.",
      "gender": "male"
    },
    {
      "name": "Sanjay Kamble",
      "flatno": "G702",
      "feedback": "The pasta was delicious, and the quantity was well balanced with the price. The quality was also great. The only thing I felt was missing was a little extra red sauce because, after two to three bites, it felt like I was just chewing boiled penne. A bit more deep red sauce would have been better, but that's just my personal preference—it may vary from person to person. One more thing: the pasta was a little spicy. If the spiciness had been more balanced, the flavor of the pasta sauce would have been even better. Overall, it was a satisfying and enjoyable meal. Swiggy and Zomato wouldn’t give such moments because they take too much time to deliver food. Since this was from the building premises, the food was perfectly hot. You guys are doing great hard work, and hard work pays off. Last but not least, the Jeera soda was also very good.",
      "gender": "male"
    },
    {
      "name": "Sooraj Pillai",
      "flatno": "F603",
      "feedback": "I literally loved the food, ekdam mast",
      "gender": "male"
    },
    {
      "name": "Vishwajeet Nemade",
      "flatno": "B1003",
      "feedback": "Thank You. All the best.",
      "gender": "male"
    },
    {
      "name": "Rishi",
      "flatno": "G1103",
      "feedback": "The Super Crunch waffle was absolutely perfect-crispy, warm, and utterly delicious",
      "gender": "male"
    },
    {
      "name": "Vaidehi Durge",
      "flatno": "G1103",
      "feedback": "Loved it",
      "gender": "female"
    },
    {
      "name": "Sanchit Malode",
      "flatno": "G806",
      "feedback": "5 star",
      "gender": "male"
    },
    {
      "name": "Vyshnavi Gostu",
      "flatno": "G103",
      "feedback": "Pasta and fries are so good. I loved it.",
      "gender": "female"
    },
    {
      "name": "Saundarya Karhade",
      "flatno": "G1103",
      "feedback": "Love the momos",
      "gender": "male"
    },
    {
      "name": "Saundarya Karhade",
      "flatno": "G1103",
      "feedback": "Love the momos",
      "gender": "female"
    },
  ];

export default reviews;