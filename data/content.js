// Archive articles (original writing) and membership tiers.
exports.articles = [
  {
    slug: "eye-of-providence",
    title: "The Eye of Providence",
    teaser: "How an eye inside a triangle travelled from Renaissance altarpieces to the back of the US dollar.",
    body: [
      "The eye inside a triangle, surrounded by rays of light, first became common in European religious art of the 1600s. The triangle stood for the Christian Trinity, and the eye stood for a God who watches over everyone.",
      "In 1782 the symbol appeared on the reverse of the Great Seal of the United States, floating above an unfinished pyramid. Since 1935 it has been printed on every one-dollar bill, which is why so many people know it today.",
      "Freemasons began using an all-seeing eye in the late 1700s as a reminder that one's actions are always seen. That overlap is the root of many modern conspiracy theories, but historians agree the symbol was shared widely long before any secret society used it.",
      "Today the eye is worn as a sign of awareness, protection and looking beyond the surface. That is the spirit our eye pieces are chosen in."
    ]
  },
  {
    slug: "square-and-compass",
    title: "The Square and Compass",
    teaser: "Builders' tools that became one of the world's best-known emblems.",
    body: [
      "Medieval stonemasons depended on two simple tools. The square checked that corners were true, and the compass drew circles and measured distances. Good work was impossible without both.",
      "When Freemasonry took shape in Britain in the early 1700s, it borrowed the language of stonemasons and turned these tools into symbols. The square came to mean honesty in one's dealings, and the compass meant keeping one's desires within sensible limits.",
      "The emblem is now used by lodges around the world. The Gilded Order is not a lodge and is not connected with Freemasonry. We simply admire the design and its message: build carefully, and live by a measure."
    ]
  },
  {
    slug: "ouroboros",
    title: "The Ouroboros",
    teaser: "The serpent that eats its own tail, from Egyptian tombs to alchemy.",
    body: [
      "One of the earliest known images of a serpent biting its own tail was found in the tomb of Tutankhamun, dating to the 1300s BC. It circled a figure on one of the gilded shrines that protected the king's body.",
      "Greek alchemists later made the ouroboros a key image. In a famous early alchemical drawing, the serpent surrounds the words 'the all is one'. It stood for endless cycles: creation and destruction, beginning and ending.",
      "The psychologist Carl Jung saw it as a symbol of the self, feeding on and renewing itself. Worn today, it is a reminder that every ending makes room for something new."
    ]
  },
  {
    slug: "the-pentagram",
    title: "The Pentagram",
    teaser: "A five-pointed star with a much older and kinder history than films suggest.",
    body: [
      "The five-pointed star drawn in one continuous line is thousands of years old. The followers of Pythagoras in ancient Greece used it as a sign of health and as a way to recognise one another.",
      "Its proportions hide the golden ratio again and again, which made it fascinating to mathematicians. In the 1500s the scholar Cornelius Agrippa drew a human figure inside it, with head, arms and legs at the five points.",
      "Only in the 1800s did writers begin to link an upside-down pentagram with darker ideas. Point-up, it remains a widely used symbol of protection and of the five elements in modern spiritual traditions."
    ]
  },
  {
    slug: "as-above-so-below",
    title: "As Above, So Below",
    teaser: "The Emerald Tablet and the idea that the small mirrors the great.",
    body: [
      "The Emerald Tablet is a short, mysterious text credited to Hermes Trismegistus, a legendary teacher who combined the Greek god Hermes and the Egyptian god Thoth. The oldest surviving versions are in Arabic, from around the 8th to 10th centuries.",
      "Its best-known line is usually summarised as 'as above, so below': the patterns of the heavens are repeated in the world, and in each person. Renaissance thinkers, early scientists and even Isaac Newton studied and translated it.",
      "The idea still appeals because it asks us to look for connections: between our habits and our results, and between small choices and the shape of a life."
    ]
  },
  {
    slug: "knights-templar",
    title: "The Knights Templar",
    teaser: "Warrior monks, a sudden downfall and seven centuries of legend.",
    body: [
      "The Knights Templar were founded around 1119 to protect pilgrims travelling to Jerusalem. They became one of the most powerful organisations in medieval Europe, with land, castles and an early form of banking.",
      "In 1307 King Philip IV of France, who owed the order money, had its members arrested on charges that most historians now see as invented. Pope Clement V dissolved the order in 1312, and its last Grand Master was burned at the stake in 1314.",
      "Their sudden fall left questions that writers have filled with stories ever since, of lost treasure, hidden knowledge and secret survival. The real history is dramatic enough on its own."
    ]
  }
];

exports.tiers = [
  {
    name: "Initiate", price: "Free", period: "", key: "initiate",
    perks: ["Monthly Gilded Letter by email", "Access to free Archive articles", "Monthly cipher puzzle", "First word on new collections"]
  },
  {
    name: "Member", price: "$9", period: "/ month", key: "member", featured: true,
    perks: ["Everything in Initiate", "10% off every shop order", "Members-only Archive stories", "Early access to limited drops", "Members' forum and monthly online meet-up"]
  },
  {
    name: "Patron", price: "$29", period: "/ month", key: "patron",
    perks: ["Everything in Member", "15% off every shop order", "A Gilded Order enamel pin each quarter", "Quarterly live salon with guest speakers", "Your name on the Patron Roll"]
  }
];
