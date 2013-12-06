var http = require('http'),
mongoose = require('mongoose'),
moment = require('moment'),
SortedList = require("sortedlist"),
natural = require('natural'),
tokenizer = new natural.WordTokenizer(),
stopwords = require('./lists/stopwords.json'),
stopwords = SortedList.create({ unique: true }, stopwords);


var Schema = mongoose.Schema;
var userSchema = new Schema({
  displayName: String,
  emails: [String],
  name: {
    familyName: String,
    givenName: String
  },
  UID: { type: String, index: { unique: true } }
});
var nodeSchema = new Schema({
  UID: { type: String, index: true },
  text: String,
  keywords: [String],
  date: String
});
var graphSchema = new Schema({
  UID: { type: String, index: true },
  name: String,
  nodes: [String],
  keywords: [String],
  date: Date,
  color: String
});
Graph = mongoose.model('Graph', graphSchema);
Node = mongoose.model('Node', nodeSchema);
User = mongoose.model('User', userSchema);
var b, n, u;


/*
JACK LONDON--------------------------------------------------------------------------------
*/
var jackLondon = [

"For two days I toiled in the prison-yard. It was heavy work, and, in spite of the fact that I malingered at every opportunity, I was played out. This was because of the food. No man could work hard on such food. Bread and water, that was all that was given us. Once a week we were supposed to get meat; but this meat did not always go around, and since all nutriment had first been boiled out of it in the making of soup, it didn't matter whether one got a taste of it once a week or not." ,

"Furthermore, there was one vital defect in the bread-and-water diet. While we got plenty of water, we did not get enough of the bread. A ration of bread was about the size of one's two fists, and three rations a day were given to each prisoner. There was one good thing, I must say, about the water--it was hot. In the morning it was called \"coffee,\" at noon it was dignified as \"soup,\" and at night it masqueraded as \"tea.\" But it was the same old water all the time. The prisoners called it \"water bewitched.\" In the morning it was black water, the color being due to boiling it with burnt bread-crusts. At noon it was served minus the color, with salt and a drop of grease added. At night it was served with a purplish-auburn hue that defied all speculation; it was darn poor tea, but it was dandy hot water." ,

"We were a hungry lot in the Erie County Pen. Only the \"long-timers\" knew what it was to have enough to eat. The reason for this was that they would have died after a time on the fare we \"short-timers\" received. I know that the long-timers got more substantial grub, because there was a whole row of them on the ground floor in our hall, and when I was a trusty, I used to steal from their grub while serving them. Man cannot live on bread alone and not enough of it." ,

"My pal delivered the goods. After two days of work in the yard I was taken out of my cell and made a trusty, a \"hall-man.\" At morning and night we served the bread to the prisoners in their cells; but at twelve o'clock a different method was used. The convicts marched in from work in a long line. As they entered the door of our hall, they broke the lock-step and took their hands down from the shoulders of their line-mates. Just inside the door were piled trays of bread, and here also stood the First Hall-man and two ordinary hall-men. I was one of the two. Our task was to hold the trays of bread as the line of convicts filed past. As soon as the tray, say, that I was holding was emptied, the other hall-man took my place with a full tray. And when his was emptied, I took his place with a full tray. Thus the line tramped steadily by, each man reaching with his right hand and taking one ration of bread from the extended tray." ,

"The task of the First Hall-man was different. He used a club. He stood beside the tray and watched. The hungry wretches could never get over the delusion that sometime they could manage to get two rations of bread out of the tray. But in my experience that sometime never came. The club of the First Hall-man had a way of flashing out--quick as the stroke of a tiger's claw--to the hand that dared ambitiously. The First Hall-man was a good judge of distance, and he had smashed so many hands with that club that he had become infallible. He never missed, and he usually punished the offending convict by taking his one ration away from him and sending him to his cell to make his meal off of hot water." , "And at times, while all these men lay hungry in their cells, I have seen a hundred or so extra rations of bread hidden away in the cells of the hall-men. It would seem absurd, our retaining this bread. But it was one of our grafts. We were economic masters inside our hall, turning the trick in ways quite similar to the economic masters of civilization. We controlled the food-supply of the population, and, just like our brother bandits outside, we made the people pay through the nose for it. We peddled the bread. Once a week, the men who worked in the yard received a five-cent plug of chewing tobacco. This chewing tobacco was the coin of the realm. Two or three rations of bread for a plug was the way we exchanged, and they traded, not because they loved tobacco less, but because they loved bread more. Oh, I know, it was like taking candy from a baby, but what would you? We had to live. And certainly there should be some reward for initiative and enterprise. Besides, we but patterned ourselves after our betters outside the walls, who, on a larger scale, and under the respectable disguise of merchants, bankers, and captains of industry, did precisely what we were doing. What awful things would have happened to those poor wretches if it hadn't been for us, I can't imagine. Heaven knows we put bread into circulation in the Erie County Pen. Ay, and we encouraged frugality and thrift ... in the poor devils who forewent their tobacco. And then there was our example. In the breast of every convict there we implanted the ambition to become even as we and run a graft. Saviours of society--I guess yes.",

"Here was a hungry man without any tobacco. Maybe he was a profligate and had used it all up on himself. Very good; he had a pair of suspenders. I exchanged half a dozen rations of bread for it--or a dozen rations if the suspenders were very good. Now I never wore suspenders, but that didn't matter. Around the corner lodged a long-timer, doing ten years for manslaughter. He wore suspenders, and he wanted a pair. I could trade them to him for some of his meat. Meat was what I wanted. Or perhaps he had a tattered, paper-covered novel. That was treasure-trove. I could read it and then trade it off to the bakers for cake, or to the cooks for meat and vegetables, or to the firemen for decent coffee, or to some one or other for the newspaper that occasionally filtered in, heaven alone knows how. The cooks, bakers, and firemen were prisoners like myself, and they lodged in our hall in the first row of cells over us.",

"In short, a full-grown system of barter obtained in the Erie County Pen. There was even money in circulation. This money was sometimes smuggled in by the short-timers, more frequently came from the barber-shop graft, where the newcomers were mulcted, but most of all flowed from the cells of the long-timers--though how they got it I don't know.",

"What of his preeminent position, the First Hall-man was reputed to be quite wealthy. In addition to his miscellaneous grafts, he grafted on us. We farmed the general wretchedness, and the First Hall-man was Farmer-General over all of us. We held our particular grafts by his permission, and we had to pay for that permission. As I say, he was reputed to be wealthy; but we never saw his money, and he lived in a cell all to himself in solitary grandeur.",

"But that money was made in the Pen I had direct evidence, for I was cell-mate quite a time with the Third Hall-man. He had over sixteen dollars. He used to count his money every night after nine o'clock, when we were locked in. Also, he used to tell me each night what he would do to me if I gave away on him to the other hall-men. You see, he was afraid of being robbed, and danger threatened him from three different directions. There were the guards. A couple of them might jump upon him, give him a good beating for alleged insubordination, and throw him into the \"solitaire\" (the dungeon); and in the mix-up that sixteen dollars of his would take wings. Then again, the First Hall-man could have taken it all away from him by threatening to dismiss him and fire him back to hard labor in the prison-yard. And yet again, there were the ten of us who were ordinary hall-men. If we got an inkling of his wealth, there was a large liability, some quiet day, of the whole bunch of us getting him into a corner and dragging him down. Oh, we were wolves, believe me--just like the fellows who do business in Wall Street.",

"He had good reason to be afraid of us, and so had I to be afraid of him. He was a huge, illiterate brute, an ex-Chesapeake-Bay-oyster-pirate, an \"ex-con\" who had done five years in Sing Sing, and a general all-around stupidly carnivorous beast. He used to trap sparrows that flew into our hall through the open bars. When he made a capture, he hurried away with it into his cell, where I have seen him crunching bones and spitting out feathers as he bolted it raw. Oh, no, I never gave away on him to the other hall-men. This is the first time I have mentioned his sixteen dollars.",

"But I grafted on him just the same. He was in love with a woman prisoner who was confined in the \"female department.\" He could neither read nor write, and I used to read her letters to him and write his replies. And I made him pay for it, too. But they were good letters. I laid myself out on them, put in my best licks, and furthermore, I won her for him; though I shrewdly guess that she was in love, not with him, but with the humble scribe. I repeat, those letters were great.",

"Another one of our grafts was \"passing the punk.\" We were the celestial messengers, the fire-bringers, in that iron world of bolt and bar. When the men came in from work at night and were locked in their cells, they wanted to smoke. Then it was that we restored the divine spark, running the galleries, from cell to cell, with our smouldering punks. Those who were wise, or with whom we did business, had their punks all ready to light. Not every one got divine sparks, however. The guy who refused to dig up, went sparkless and smokeless to bed. But what did we care? We had the immortal cinch on him, and if he got fresh, two or three of us would pitch on him and give him \"what-for.\"",

"You see, this was the working-theory of the hall-men. There were thirteen of us. We had something like half a thousand prisoners in our hall. We were supposed to do the work, and to keep order. The latter was the function of the guards, which they turned over to us. It was up to us to keep order; if we didn't, we'd be fired back to hard labor, most probably with a taste of the dungeon thrown in. But so long as we maintained order, that long could we work our own particular grafts.",

"Bear with me a moment and look at the problem. Here were thirteen beasts of us over half a thousand other beasts. It was a living hell, that prison, and it was up to us thirteen there to rule. It was impossible, considering the nature of the beasts, for us to rule by kindness. We ruled by fear. Of course, behind us, backing us up, were the guards. In extremity we called upon them for help; but it would bother them if we called upon them too often, in which event we could depend upon it that they would get more efficient trusties to take our places. But we did not call upon them often, except in a quiet sort of way, when we wanted a cell unlocked in order to get at a refractory prisoner inside. In such cases all the guard did was to unlock the door and walk away so as not to be a witness of what happened when half a dozen hall-men went inside and did a bit of man-handling.",

"As regards the details of this man-handling I shall say nothing. And after all, man-handling was merely one of the very minor unprintable horrors of the Erie County Pen. I say \"unprintable\"; and in justice I must also say \"unthinkable.\" They were unthinkable to me until I saw them, and I was no spring chicken in the ways of the world and the awful abysses of human degradation. It would take a deep plummet to reach bottom in the Erie County Pen, and I do but skim lightly and facetiously the surface of things as I there saw them.",

"At times, say in the morning when the prisoners came down to wash, the thirteen of us would be practically alone in the midst of them, and every last one of them had it in for us. Thirteen against five hundred, and we ruled by fear. We could not permit the slightest infraction of rules, the slightest insolence. If we did, we were lost. Our own rule was to hit a man as soon as he opened his mouth--hit him hard, hit him with anything. A broom-handle, end-on, in the face, had a very sobering effect. But that was not all. Such a man must be made an example of; so the next rule was to wade right in and follow him up. Of course, one was sure that every hall-man in sight would come on the run to join in the chastisement; for this also was a rule. Whenever any hall-man was in trouble with a prisoner, the duty of any other hall-man who happened to be around was to lend a fist. Never mind the merits of the case--wade in and hit, and hit with anything; in short, lay the man out.",

"I remember a handsome young mulatto of about twenty who got the insane idea into his head that he should stand for his rights. And he did have the right of it, too; but that didn't help him any. He lived on the topmost gallery. Eight hall-men took the conceit out of him in just about a minute and a half--for that was the length of time required to travel along his gallery to the end and down five flights of steel stairs. He travelled the whole distance on every portion of his anatomy except his feet, and the eight hall-men were not idle. The mulatto struck the pavement where I was standing watching it all. He regained his feet and stood upright for a moment. In that moment he threw his arms wide apart and omitted an awful scream of terror and pain and heartbreak. At the same instant, as in a transformation scene, the shreds of his stout prison clothes fell from him, leaving him wholly naked and streaming blood from every portion of the surface of his body. Then he collapsed in a heap, unconscious. He had learned his lesson, and every convict within those walls who heard him scream had learned a lesson. So had I learned mine. It is not a nice thing to see a man's heart broken in a minute and a half.",

"The following will illustrate how we drummed up business in the graft of passing the punk. A row of newcomers is installed in your cells. You pass along before the bars with your punk. \"Hey, Bo, give us a light,\" some one calls to you. Now this is an advertisement that that particular man has tobacco on him. You pass in the punk and go your way. A little later you come back and lean up casually against the bars. \"Say, Bo, can you let us have a little tobacco?\" is what you say. If he is not wise to the game, the chances are that he solemnly avers that he hasn't any more tobacco. All very well. You condole with him and go your way. But you know that his punk will last him only the rest of that day. Next day you come by, and he says again, \"Hey, Bo, give us a light.\" And you say, \"You haven't any tobacco and you don't need a light.\" And you don't give him any, either. Half an hour after, or an hour or two or three hours, you will be passing by and the man will call out to you in mild tones, \"Come here, Bo.\" And you come. You thrust your hand between the bars and have it filled with precious tobacco. Then you give him a light.",

"Sometimes, however, a newcomer arrives, upon whom no grafts are to be worked. The mysterious word is passed along that he is to be treated decently. Where this word originated I could never learn. The one thing patent is that the man has a \"pull.\" It may be with one of the superior hall-men; it may be with one of the guards in some other part of the prison; it may be that good treatment has been purchased from grafters higher up; but be it as it may, we know that it is up to us to treat him decently if we want to avoid trouble.",

"We hall-men were middle-men and common carriers. We arranged trades between convicts confined in different parts of the prison, and we put through the exchange. Also, we took our commissions coming and going. Sometimes the objects traded had to go through the hands of half a dozen middle-men, each of whom took his whack, or in some way or another was paid for his service.",

"Sometimes one was in debt for services, and sometimes one had others in his debt. Thus, I entered the prison in debt to the convict who smuggled in my things for me. A week or so afterward, one of the firemen passed a letter into my hand. It had been given to him by a barber. The barber had received it from the convict who had smuggled in my things. Because of my debt to him I was to carry the letter on. But he had not written the letter. The original sender was a long-timer in his hall. The letter was for a woman prisoner in the female department. But whether it was intended for her, or whether she, in turn, was one of the chain of go-betweens, I did not know. All that I knew was her description, and that it was up to me to get it into her hands.",

"Two days passed, during which time I kept the letter in my possession; then the opportunity came. The women did the mending of all the clothes worn by the convicts. A number of our hall-men had to go to the female department to bring back huge bundles of clothes. I fixed it with the First Hall-man that I was to go along. Door after door was unlocked for us as we threaded our way across the prison to the women's quarters. We entered a large room where the women sat working at their mending. My eyes were peeled for the woman who had been described to me. I located her and worked near to her. Two eagle-eyed matrons were on watch. I held the letter in my palm, and I looked my intention at the woman. She knew I had something for her; she must have been expecting it, and had set herself to divining, at the moment we entered, which of us was the messenger. But one of the matrons stood within two feet of her. Already the hall-men were picking up the bundles they were to carry away. The moment was passing. I delayed with my bundle, making believe that it was not tied securely. Would that matron ever look away? Or was I to fail? And just then another woman cut up playfully with one of the hall-men--stuck out her foot and tripped him, or pinched him, or did something or other. The matron looked that way and reprimanded the woman sharply. Now I do not know whether or not this was all planned to distract the matron's attention, but I did know that it was my opportunity. My particular woman's hand dropped from her lap down by her side. I stooped to pick up my bundle. From my stooping position I slipped the letter into her hand, and received another in exchange. The next moment the bundle was on my shoulder, the matron's gaze had returned to me because I was the last hall-man, and I was hastening to catch up with my companions. The letter I had received from the woman I turned over to the fireman, and thence it passed through the hands of the barber, of the convict who had smuggled in my things, and on to the long-timer at the other end.",

"Often we conveyed letters, the chain of communication of which was so complex that we knew neither sender nor sendee. We were but links in the chain. Somewhere, somehow, a convict would thrust a letter into my hand with the instruction to pass it on to the next link. All such acts were favors to be reciprocated later on, when I should be acting directly with a principal in transmitting letters, and from whom I should be receiving my pay. The whole prison was covered by a network of lines of communication. And we who were in control of the system of communication, naturally, since we were modelled after capitalistic society, exacted heavy tolls from our customers. It was service for profit with a vengeance, though we were at times not above giving service for love.",

"And all the time I was in the Pen I was making myself solid with my pal. He had done much for me, and in return he expected me to do as much for him. When we got out, we were to travel together, and, it goes without saying, pull off \"jobs\" together. For my pal was a criminal--oh, not a jewel of the first water, merely a petty criminal who would steal and rob, commit burglary, and, if cornered, not stop short of murder. Many a quiet hour we sat and talked together. He had two or three jobs in view for the immediate future, in which my work was cut out for me, and in which I joined in planning the details. I had been with and seen much of criminals, and my pal never dreamed that I was only fooling him, giving him a string thirty days long. He thought I was the real goods, liked me because I was not stupid, and liked me a bit, too, I think, for myself. Of course I had not the slightest intention of joining him in a life of sordid, petty crime; but I'd have been an idiot to throw away all the good things his friendship made possible. When one is on the hot lava of hell, he cannot pick and choose his path, and so it was with me in the Erie County Pen. I had to stay in with the \"push,\" or do hard labor on bread and water; and to stay in with the push I had to make good with my pal.",

"Life was not monotonous in the Pen. Every day something was happening: men were having fits, going crazy, fighting, or the hall-men were getting drunk. Rover Jack, one of the ordinary hall-men, was our star \"oryide.\" He was a true \"profesh,\" a \"blowed-in-the-glass\" stiff, and as such received all kinds of latitude from the hall-men in authority. Pittsburg Joe, who was Second Hall-man, used to join Rover Jack in his jags; and it was a saying of the pair that the Erie County Pen was the only place where a man could get \"slopped\" and not be arrested. I never knew, but I was told that bromide of potassium, gained in devious ways from the dispensary, was the dope they used. But I do know, whatever their dope was, that they got good and drunk on occasion.",
"Our hall was a common stews, filled with the ruck and the filth, the scum and dregs, of society--hereditary inefficients, degenerates, wrecks, lunatics, addled intelligences, epileptics, monsters, weaklings, in short, a very nightmare of humanity. Hence, fits flourished with us. These fits seemed contagious. When one man began throwing a fit, others followed his lead. I have seen seven men down with fits at the same time, making the air hideous with their cries, while as many more lunatics would be raging and gibbering up and down. Nothing was ever done for the men with fits except to throw cold water on them. It was useless to send for the medical student or the doctor. They were not to be bothered with such trivial and frequent occurrences.",
"There was a young Dutch boy, about eighteen years of age, who had fits most frequently of all. He usually threw one every day. It was for that reason that we kept him on the ground floor farther down in the row of cells in which we lodged. After he had had a few fits in the prison-yard, the guards refused to be bothered with him any more, and so he remained locked up in his cell all day with a Cockney cell-mate, to keep him company. Not that the Cockney was of any use. Whenever the Dutch boy had a fit, the Cockney became paralyzed with terror.",
"The Dutch boy could not speak a word of English. He was a farmer's boy, serving ninety days as punishment for having got into a scrap with some one. He prefaced his fits with howling. He howled like a wolf. Also, he took his fits standing up, which was very inconvenient for him, for his fits always culminated in a headlong pitch to the floor. Whenever I heard the long wolf-howl rising, I used to grab a broom and run to his cell. Now the trusties were not allowed keys to the cells, so I could not get in to him. He would stand up in the middle of his narrow cell, shivering convulsively, his eyes rolled backward till only the whites were visible, and howling like a lost soul. Try as I would, I could never get the Cockney to lend him a hand. While he stood and howled, the Cockney crouched and trembled in the upper bunk, his terror-stricken gaze fixed on that awful figure, with eyes rolled back, that howled and howled. It was hard on him, too, the poor devil of a Cockney. His own reason was not any too firmly seated, and the wonder is that he did not go mad.",
"All that I could do was my best with the broom. I would thrust it through the bars, train it on Dutchy's chest, and wait. As the crisis approached he would begin swaying back and forth. I followed this swaying with the broom, for there was no telling when he would take that dreadful forward pitch. But when he did, I was there with the broom, catching him and easing him down. Contrive as I would, he never came down quite gently, and his face was usually bruised by the stone floor. Once down and writhing in convulsions, I'd throw a bucket of water over him. I don't know whether cold water was the right thing or not, but it was the custom in the Erie County Pen. Nothing more than that was ever done for him. He would lie there, wet, for an hour or so, and then crawl into his bunk. I knew better than to run to a guard for assistance. What was a man with a fit, anyway?",
"In the adjoining cell lived a strange character--a man who was doing sixty days for eating swill out of Barnum's swill-barrel, or at least that was the way he put it. He was a badly addled creature, and, at first, very mild and gentle. The facts of his case were as he had stated them. He had strayed out to the circus ground, and, being hungry, had made his way to the barrel that contained the refuse from the table of the circus people. \"And it was good bread,\" he often assured me; \"and the meat was out of sight.\" A policeman had seen him and arrested him, and there he was.",

"Once I passed his cell with a piece of stiff thin wire in my hand. He asked me for it so earnestly that I passed it through the bars to him. Promptly, and with no tool but his fingers, he broke it into short lengths and twisted them into half a dozen very creditable safety pins. He sharpened the points on the stone floor. Thereafter I did quite a trade in safety pins. I furnished the raw material and peddled the finished product, and he did the work. As wages, I paid him extra rations of bread, and once in a while a chunk of meat or a piece of soup-bone with some marrow inside.",

"But his imprisonment told on him, and he grew violent day by day. The hall-men took delight in teasing him. They filled his weak brain with stories of a great fortune that had been left him. It was in order to rob him of it that he had been arrested and sent to jail. Of course, as he himself knew, there was no law against eating out of a barrel. Therefore he was wrongly imprisoned. It was a plot to deprive him of his fortune.",

"The first I knew of it, I heard the hall-men laughing about the string they had given him. Next he held a serious conference with me, in which he told me of his millions and the plot to deprive him of them, and in which he appointed me his detective. I did my best to let him down gently, speaking vaguely of a mistake, and that it was another man with a similar name who was the rightful heir. I left him quite cooled down; but I couldn't keep the hall-men away from him, and they continued to string him worse than ever. In the end, after a most violent scene, he threw me down, revoked my private detectiveship, and went on strike. My trade in safety pins ceased. He refused to make any more safety pins, and he peppered me with raw material through the bars of his cell when I passed by.",

"I could never make it up with him. The other hall-men told him that I was a detective in the employ of the conspirators. And in the meantime the hall-men drove him mad with their stringing. His fictitious wrongs preyed upon his mind, and at last he became a dangerous and homicidal lunatic. The guards refused to listen to his tale of stolen millions, and he accused them of being in the plot. One day he threw a pannikin of hot tea over one of them, and then his case was investigated. The warden talked with him a few minutes through the bars of his cell. Then he was taken away for examination before the doctors. He never came back, and I often wonder if he is dead, or if he still gibbers about his millions in some asylum for the insane.",

"At last came the day of days, my release. It was the day of release for the Third Hall-man as well, and the short-timer girl I had won for him was waiting for him outside the wall. They went away blissfully together. My pal and I went out together, and together we walked down into Buffalo. Were we not to be together always? We begged together on the \"main-drag\" that day for pennies, and what we received was spent for \"shupers\" of beer--I don't know how they are spelled, but they are pronounced the way I have spelled them, and they cost three cents. I was watching my chance all the time for a get-away. From some bo on the drag I managed to learn what time a certain freight pulled out. I calculated my time accordingly. When the moment came, my pal and I were in a saloon. Two foaming shupers were before us. I'd have liked to say good-by. He had been good to me. But I did not dare. I went out through the rear of the saloon and jumped the fence. It was a swift sneak, and a few minutes later I was on board a freight and heading south on the Western New York and Pennsylvania Railroad."

];
var UID = 'JACK_LONDON';

mongoose.connect('mongodb://localhost/nodehub');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  u = new User({
    displayName: "Jack London",
    emails: ['jacklondon@example.com'],
    name: {
      familyName: "London",
      givenName: "Jack"
    },
    UID: UID
  });
  u.save(function(err) {
    console.log(u);
    for (var i = 0; i < jackLondon.length; i++) {
      n = new Node({
        text: jackLondon[i],
        UID: UID,
        keywords: getKeywords(jackLondon[i]),
        date: moment("12-25-1905 12:14:55", "MM-DD-YYYY HH:mm:ss").format('YYYY-MM-DD HH:mm:ss')
      });
      n.save(function(err){
        console.log(n);
      });
    }
  });
});



/*
EDGAR ALLAN POE--------------------------------------------------------------------------------
*/

// var poe = [
// "Once upon a midnight dreary, while I pondered, weak and weary,  \n  Over many a quaint and curious volume of forgotten lore,  \n  While I nodded, nearly napping, suddenly there came a tapping,  \n  As of some one gently rapping, rapping at my chamber door.  \n ''T is some visiter,' I muttered, 'tapping at my chamber door--  \n  Only this, and nothing more.'",
// "Ah, distinctly I remember it was in the bleak December, \n And each separate dying ember wrought its ghost upon the floor. \n Eagerly I wished the morrow:--vainly I had sought to borrow \n From my books surcease of sorrow--sorrow for the lost Lenore-- \n For the rare and radiant maiden whom the angels name Lenore-- \n Nameless here for evermore.",
// "And the silken sad uncertain rustling of each purple curtain \n Thrilled me--filled me with fantastic terrors never felt before; \n So that now, to still the beating of my heart, I stood repeating \n ''T is some visiter entreating entrance at my chamber door \n Some late visiter entreating entrance at my chamber door;-- \n This it is, and nothing more.'",
// "Presently my soul grew stronger; hesitating then no longer, \n 'Sir,' said I, 'or Madam, truly your forgiveness I implore; \n But the fact is I was napping, and so gently you came rapping, \n And so faintly you came tapping, tapping at my chamber door, \n That I scarce was sure I heard you'--here I opened wide the door;-- \n Darkness there, and nothing more.",
// "Deep into that darkness peering, long I stood there wondering, fearing, \n Doubting, dreaming dreams no mortal ever dared to dream before; \n But the silence was unbroken, and the darkness gave no token, \n And the only word there spoken was the whispered word, 'Lenore!' \n This I whispered, and an echo murmured back the word, 'Lenore!' \n Merely this and nothing more.",
// "Back into the chamber turning, all my soul within me burning, \n Soon again I heard a tapping, somewhat louder than before. \n 'Surely,' said I, 'surely that is something at my window lattice; \n Let me see, then, what thereat is, and this mystery explore-- \n Let my heart be still a moment and this mystery explore;-- \n 'T is the wind and nothing more!'",
// "Open here I flung the shutter, when, with many a flirt and flutter, \n In there stepped a stately Raven of the saintly days of yore. \n Not the least obeisance made he; not a minute stopped or stayed he; \n But, with mien of lord or lady, perched above my chamber door-- \n Perched upon a bust of Pallas just above my chamber door-- \n Perched, and sat, and nothing more.",
// "Then this ebony bird beguiling my sad fancy into smiling, \n By the grave and stern decorum of the countenance it wore, \n 'Though thy crest be shorn and shaven, thou,' I said, 'art sure no craven, \n Ghastly grim and ancient Raven wandering from the Nightly shore,-- \n Tell me what thy lordly name is on the Night's Plutonian shore!' \n Quoth the Raven, 'Nevermore.'",
// "Much I marvelled this ungainly fowl to hear discourse so plainly, \n Though its answer little meaning--little relevancy bore; \n For we cannot help agreeing that no living human being \n Ever yet was blessed with seeing bird above his chamber door-- \n Bird or beast upon the sculptured bust above his chamber door, \n With such name as 'Nevermore.'",
// "But the Raven, sitting lonely on the placid bust, spoke only \n That one word, as if his soul in that one word he did outpour. \n Nothing further then he uttered--not a feather then he fluttered-- \n Till I scarcely more than muttered, 'Other friends have flown before-- \n On the morrow _he_ will leave me, as my hopes have flown before.' \n Then the bird said, 'Nevermore.'",
// "Startled at the stillness broken by reply so aptly spoken, \n 'Doubtless,' said I, 'what it utters is its only stock and store, \n Caught from some unhappy master whom unmerciful Disaster \n Followed fast and followed faster till his songs one burden bore-- \n Till the dirges of his Hope that melancholy burden bore \n Of 'Never--nevermore.''",
// "But the Raven still beguiling all my sad soul into smiling, \n Straight I wheeled a cushioned seat in front of bird and bust and door; \n Then, upon the velvet sinking, I betook myself to linking \n Fancy unto fancy, thinking what this ominous bird of yore-- \n What this grim, ungainly, ghastly, gaunt and ominous bird of yore \n Meant in croaking 'Nevermore.'",
// "This I sat engaged in guessing, but no syllable expressing \n To the fowl whose fiery eyes now burned into my bosom's core; \n This and more I sat divining, with my head at ease reclining \n On the cushion's velvet lining that the lamplight gloated o'er, \n But whose velvet violet lining with the lamplight gloating o'er \n _She_ shall press, ah, nevermore!",
// "Then, methought, the air grew denser, perfumed from an unseen censer \n Swung by seraphim whose foot-falls tinkled on the tufted floor. \n 'Wretch,' I cried, 'thy God hath lent thee--by these angels he hath sent thee \n Respite--respite and nepenthe from thy memories of Lenore! \n Quaff, oh quaff this kind nepenthe, and forget this lost Lenore!' \n Quoth the Raven, 'Nevermore.'",
// "'Prophet!' said I, 'thing of evil!--prophet still, if bird or devil!-- \n Whether Tempter sent, or whether tempest tossed thee here ashore, \n Desolate yet all undaunted, on this desert land enchanted-- \n On this home by Horror haunted--tell me truly, I implore-- \n Is there--_is_ there balm in Gilead?--tell me--tell me, I implore!' \n Quoth the Raven, 'Nevermore.'",
// "'Prophet!' said I, 'thing of evil--prophet still, if bird or devil! \n By that Heaven that bends above, us--by that God we both adore-- \n Tell this soul with sorrow laden if, within the distant Aidenn, \n It shall clasp a sainted maiden whom the angels name Lenore-- \n Clasp a rare and radiant maiden whom the angels name Lenore.' \n Quoth the Raven, 'Nevermore.'",
// "'Be that word our sign of parting, bird or fiend!' I shrieked, upstarting-- \n 'Get thee back into the tempest and the Night's Plutonian shore! \n Leave no black plume as a token of that lie thy soul hath spoken! \n Leave my loneliness unbroken!--quit the bust above my door! \n Take thy beak from out my heart, and take thy form from off my door!' \n Quoth the Raven, 'Nevermore.'",
// "And the Raven, never flitting, still is sitting, still is sitting \n On the pallid bust of Pallas just above my chamber door; \n And his eyes have all the seeming of a demon's that is dreaming, \n And the lamplight o'er him streaming throws his shadow on the floor; \n And my soul from out that shadow that lies floating on the floor \n Shall be lifted--nevermore!"
// ];
// 






function getKeywords(text) {
  var words = tokenizer.tokenize(text);
  words = SortedList.create({ unique: true }, words);
  words = words.toArray();
  for (var i = 0; i < words.length; i++) {
    words[i] = words[i].toLowerCase();
  }
  //Eliminating unfavorable words.
  for (var i = 0; i < words.length; i++) {
    if (words[i].match(/^[A-Za-z]+$/) === null || stopwords.key(words[i]) !== null || words[i].length == 1) {  
      delete words[i];
    }
  }
  words = words.filter(function(element, index, array) {
    if (words[index] !== null && words[index] !== undefined) {
      return words[index];
    }
  });
  return words;
}