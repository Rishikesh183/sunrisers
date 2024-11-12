import React from 'react';
import images from './images.js';
export default function About(props) {
    const mode = "light";
    document.body.style.backgroundColor = '#e67e22';
    const styles = {
        container: {
            maxWidth: '85vw',
            margin: '0 auto',
            padding: '3vw',
            fontFamily: 'Roboto, sans-serif',
            backgroundColor: mode === 'light' ? '#e67e22' : '#333',
            color: mode === 'light' ? '#333' : '#fdf6e4',
            borderRadius: '2vw',
            animation: 'fadeIn 1s ease-in-out'
        },
        heading: {
            fontSize: '36px',
            fontWeight: '700',
            marginBottom: '20px',
            color: mode === 'light' ? 'black' : '#fdf6e4',
            textAlign: 'center',
            textTransform: 'uppercase',
            letterSpacing: '3px',
        },
        subHeading: {
            fontSize: '24px',
            fontWeight: '600',
            marginTop: '30px',
            marginBottom: '15px',
            color: 'black',
            borderBottom: `3px solid ${mode === 'light' ? 'black' : '#fdf6e4'}`,
            paddingBottom: '10px',
        },
        paragraph: {
            fontSize: '18px',
            marginBottom: '20px',
            lineHeight: '1.8',
            color: mode === 'light' ? 'black' : '#dcdcdc',
        },
        img: {
            borderRadius: "1vw",
            width: '30%',
            height: '30%',
            marginLeft: '1vw',
            marginTop: '1vw',
            display: 'flex',
            marginBottom: "1vw"
        },
        imgs: {
            borderRadius: "1vw",
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-around'
        },
        highlights: {
            display: 'flex',
            flexDirection: 'row',
            backgroundColor: mode === 'light' ? '#ffab73' : '#444',
            padding: '20px',
            borderRadius: '10px',
            marginBottom: '20px',
            borderLeft: `5px solid ${mode === 'light' ? 'black' : '#fdf6e4'}`,
            borderRight: `5px solid ${mode === 'light' ? 'black' : '#fdf6e4'}`,
        },
        list: {
            listStyleType: 'disc',
            paddingLeft: '20px',
            fontSize: '18px',
            marginBottom: '20px',
            color: mode === 'light' ? '#333' : '#dcdcdc',
        },
        listItem: {
            marginBottom: '10px',
        },
        highlight: {
            backgroundColor: mode === 'light' ? '#ffab73' : '#444',
            padding: '20px',
            borderRadius: '10px',
            borderLeft: `5px solid ${mode === 'light' ? 'black' : '#fdf6e4'}`,
            borderRight: `5px solid ${mode === 'light' ? 'black' : '#fdf6e4'}`,
        },
        thankYou: {
            marginTop: '40px',
            fontSize: '16px',
            fontStyle: 'italic',
            color: 'black',
            textAlign: 'center',
        },
        accent: {
            color: 'black',
            fontWeight: 'bold',
        },
        '@keyframes fadeIn': {
            from: { opacity: 0 },
            to: { opacity: 1 },
        },
        '@media (max-width: 768px)': {
            container: {
                padding: '20px',
                marginTop: '40px',
            },
            heading: {
                fontSize: '28px',
            },
            subHeading: {
                fontSize: '20px',
            },
            paragraph: {
                fontSize: '16px',
            },
            list: {
                fontSize: '16px',
            },
        },
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.heading}>Sunrisers Hyderabad</h1>
            <h2 style={styles.subHeading}>Initial Years</h2>
            <div style={styles.highlights}>
                <p style={styles.paragraph}>
                    <span style={styles.accent}>Sunrisers Hyderabad </span>replaced the Deccan Chargers in 2012 and debuted in 2013. The franchise was taken over by Sun TV Network after the Deccan Chronicle went bankrupt. The squad was announced in Chennai on 18 December 2012. The team is owned by Sun TV Network who won the bid with ₹85.05 crore (US$10 million) per year for a five-year deal, a week after the Chargers were terminated due to prolonged financial issues. Sun TV Network Limited, which is headquartered in Chennai, is one of India's biggest television networks with 32 TV channels and 45 FM radio stations, making it India's largest media and entertainment company.The team jersey was unveiled on 8 March 2013, and the team anthem composed by G. V. Prakash Kumar was released on 12 March 2013. The logo was unveiled on 20 December 2012, along with the announcement that the team&apos;s management would be led by Kris Srikkanth, now replaced by veteran Muttiah Muralitharan, Tom Moody and V. V. S. Laxman.
                </p>
                <img src={images.eagle} style={styles.img} alt="" />
            </div>

            <h2 style={styles.subHeading}>Championships and Consecutive Playoffs</h2>
            <div style={styles.highlight}>
                <p style={styles.paragraph}>For the 2016 season, SRH retained 15 players and released nine. After the auction, SRH traded two players. Sunrisers Hyderabad were crowned champions under David Warner&apos;s magnificent captaincy after defeating Royal Challengers Bangalore in the final and ending the season with 11 wins and six losses. This was their maiden, and to date only, title. Bhuvneshwar Kumar became the first Sunrisers Hyderabad player to win the Purple Cap.</p>
                <div style={styles.imgs}>
                    <img src={images.ipl20161} style={styles.img} alt="" />
                    <img src={images.ipl20162} style={styles.img} alt="" />
                    <img src={images.ipl20163} style={styles.img} alt="" />
                </div>
                <p style={styles.paragraph}>For the 2017 season, SRH retained 17 players and released six from the title-winning squad. The team then spent ₹45.1 crore (US$5.4 million) at the auction, leaving ₹20.9 crore (US$2.5 million) remaining. As the defending champions, as per IPL norms, SRH hosted both the opening and closing ceremonies of the season. The team finished 3rd on points in the table. They lost against the Kolkata Knight Riders in the eliminator match at the M. Chinnaswamy Stadium in Bangalore. The team made a below-par total of 128–7 in 20 overs, but the Kolkata Knight Riders innings was reduced to just six overs due to rain. The revised total was 48, which the Knight Riders met with seven wickets and four balls remaining. Bhuvneshwar Kumar was able to retain the Purple Cap while David Warner won the Orange Cap.</p>
                <p style={styles.paragraph}>For the 2018 season, the Chennai Super Kings and Rajasthan Royals were reinstated in the league after serving a two-year suspension from the competition due to the involvement of their players in the 2013 IPL betting scandal. The IPL governing council decided that a maximum of five players can be retained by each IPL team. SRH retained only two players and released all remaining players from the squad. The retention of two players meant SRH went in to the 2018 IPL auction with ₹59 crore in their auction purse and three right-to-match (RTM) cards. The salary deduction for every retained player from the franchise&apos;s salary purse was stipulated to be ₹15 crore, ₹11 crore and ₹7 crore if three players were retained; ₹12.5 crore and ₹8.5 crore if two players were retained; and ₹12.5 crore if only one player was retained. For retaining an uncapped player, salary deduction was set at ₹3 crore. David Warner had stepped down from captaincy on 28 March 2018 and the BCCI announced that he will not be allowed to play in IPL 2018 following the Australian ball-tampering controversy. On 29 March, New Zealand captain Kane Williamson was chosen to lead SRH for the 2018 season. On 31 March, England batsman Alex Hales was announced as replacement for the banned Warner. SRH finished the 2018 season as runners-up of the competition after losing to Chennai Super Kings in the final with 10 wins and seven losses. Williamson won the Orange Cap with 735 runs.</p>
                <div style={styles.imgs}>
                    <img src={images.ipl20181} style={styles.img} alt="" />
                    <img src={images.ipl20182} style={styles.img} alt="" />
                </div>
                <p style={styles.paragraph}>Ahead of the auction, SRH traded Shikhar Dhawan to Delhi Capitals in favour of Shahbaz Nadeem, Vijay Shankar and Abhishek Sharma. SRH retained 17 players and released nine players. On auction day (18 December 2018), SRH bought three new players; Jonny Bairstow, Martin Guptill and Wriddhiman Saha, the latter of which was bought back in the auction after initially being released. David Warner made a comeback to IPL on 24 March 2019 after he was banned by BCCI to participate in 2018 season due to Australian ball-tampering controversy. SRH decided to stay with Kane Williamson as captain and Bhuvneshwar Kumar as vice-captain. Before start of the season, Williamson was nursing an injury and Kumar led the team in the first game against Kolkata Knight Riders and from the third game till the sixth game. SRH ended the 2019 season with 6 wins and 9 losses. They lost against Delhi Capitals in the Eliminator at Dr. Y. S. Rajasekhara Reddy ACA-VDCA Cricket Stadium in Visakhapatnam. Warner won the orange cap in this season.</p>
                <div style={styles.imgs}>
                    <img src={images.ipl20191} style={styles.img} alt="" />
                    <img src={images.ipl20192} style={styles.img} alt="" />
                </div>
                <p style={styles.paragraph}>Ahead of the auction, SRH retained 18 players and released 5 players. On auction day (19 December 2019), SRH bought 7 new players including the likes of Mitchell Marsh and Priyam Garg among others. SRH parted ways with Tom Moody and Simon Helmot and named Trevor Bayliss and Brad Haddin as Head coach and Assistant Coach respectively. On 27 February 2020, Warner was reinstated as captain of SRH replacing Kane Williamson. SRH ended their 2020 campaign with 8 wins and 8 losses. In the playoffs, they beat the Royal Challengers Bangalore before losing to the Delhi Capitals in the Qualifier 2 at Sheikh Zayed Cricket Stadium in Abu Dhabi with Warner as their highest run-scorer for the season.</p>
                <div style={styles.imgs}>
                    <img src={images.ipl20201} style={styles.img} alt="" />
                    <img src={images.ipl20202} style={styles.img} alt="" />
                    <img src={images.ipl20203} style={styles.img} alt="" />
                </div>
            </div>

            <h2 style={styles.subHeading}>2021-2023 : Later Struggles</h2>
            <div style={styles.highlight}>
                <p style={styles.paragraph}>Ahead of the 2021 auction, SRH retained 22 players and released 5 players. On auction day (18 February 2021), SRH bought 3 players - J Suchith, Mujeeb Ur Rahman, and Kedar Jadhav. In addition, SRH added Tom Moody back to the staff team as the Director of Cricket. Following the team&apos;s poor start to the season with 1 win from 7 games, SRH announced Kane Williamson as their captain for the remainder of the season replacing David Warner.</p>
                <div style={styles.imgs}>
                    <img src={images.ipl20211} style={styles.img} alt="" />
                    <img src={images.ipl20212} style={styles.img} alt="" />
                </div>
                <p style={styles.paragraph}>Tom Moody and Simon Helmot became the head coach and assistant-coach respectively for their second stint following the departure of Trevor Bayliss and Brad Haddin as Head coach and assistant coach respectively. Dale Steyn has been appointed as the Fast bowling coach for SRH while Muttiah Muralitharan remained as the spin bowling coach. Ahead of the Mega auction, SRH retained Kane Williamson, Abdul Samad, and Umran Malik and has released other players including Jonny Bairstow, Warner, Rashid Khan, Manish Pandey, Sandeep Sharma and Siddarth Kaul for the 2022 Mega auction. SRH has bought Bhuvneshwar Kumar, T. Natarajan, Marco Jansen, Aiden Markram, Rahul Tripathi, Abhishek Sharma, Romario Shepherd, Washington Sundar, Nicholas Pooran and Glenn Phillips during the IPL 2022 Mega auction. Kane Williamson led the team in the 2022 season. They finished in 8th place on the points table. After initial success, the team lost five back-to-back matches and didn&apos;t qualify for the playoffs.</p>
                <div style={styles.imgs}>
                    <img src={images.ipl20221} style={styles.img} alt="" />
                    <img src={images.ipl20222} style={styles.img} alt="" />
                </div>
                <p style={styles.paragraph}>SRH appointed Brian Lara as the head coach ahead of the 2023 season replacing Tom Moody. SRH have announced Aiden Markram as the new captain for 2023 season replacing former captain Kane Williamson following a poor 2022 season. Ahead of the auction, SRH retained 12 players while the franchise released their captain Kane Williamson and other players including Nicholas Pooran, Jagadeesha Suchith, and Romario Shepherd. On the auction day, their significant buys were Harry Brook, Mayank Agarwal, Heinrich Klaasen and Adil Rashid. The team disappointed, managing only 4 wins over the season (including a solitary win at the home ground) while many players had difficult campaigns, including Brook, Agarwal and Malik with Heinrich Klaasen, Bhuvneshwar Kumar and Mayank Markande performances being the positives.</p>
                <div style={styles.imgs}>
                    <img src={images.ipl20231} style={styles.img} alt="" />
                    <img src={images.ipl20232} style={styles.img} alt="" />
                </div>
            </div>

            <h2 style={styles.subHeading}>2024 : Fiery Redemption</h2>
            <div style={styles.highlight}>
                <p style={styles.paragraph}>Following the 2023 season debacle, SRH announced Daniel Vettori as the head coach replacing Brian Lara and released the likes of Harry Brook, Adil Rashid, and Kartik Tyagi ahead of the IPL 2024 auction. SRH traded Mayank Dagar to Royal Challengers Bengaluru and got Shahbaz Ahmed in return ahead of the players retention/release deadline. On the auction day, SRH purchased the likes of Pat Cummins, Travis Head, Wanindu Hasaranga, Jaydev Unadkat. SRH announced Pat Cummins as the new captain for the 2024 season replacing former captain Aiden Markram following a poor 2023 season.</p>
                <div style={styles.imgs}>
                    <img src={images.ipl20245} style={styles.img} alt="" />
                    <img src={images.ipl20241} style={styles.img} alt="" />
                </div>
                <p style={styles.paragraph}>The team started off their campaign with a narrow defeat against Kolkata Knight Riders. On 27 March 2024, Sunrisers Hyderabad surpassed Royal Challengers Bengaluru&apos;s 11-year-old record of the highest-ever IPL total of 263 runs by scoring 277 against Mumbai Indians, & securing a 31-run victory at the in Hyderabad. Following this, the team endured another narrow defeat to Gujarat Titans. The team then went with a 4 match winning streak against Chennai Super Kings, Punjab Kings, Royal Challengers Bangalore and Delhi Capitals with the last 3 being at their respective home grounds.</p>
                <p style={styles.paragraph}>On 15 April 2024, Sunrisers Hyderabad broke their own record for the highest IPL total with a sensational 287 for three against Royal Challengers Bengaluru in Bengaluru. SRH's total is also the second-highest T20 cricket, only behind Nepal's 314/3 against Mongolia in 2023. In reply, RCB racked up 262 for seven in a 25-run defeat, the highest T20 score ever to end up on the losing side.</p>
                <div style={styles.imgs}>
                    <img src={images.ipl20244} style={styles.img} alt="" />
                    <img src={images.ipl20242} style={styles.img} alt="" />
                    <img src={images.ipl20246} style={styles.img} alt="" />
                </div>
                <p style={styles.paragraph}>Following the 4 match winning streak, the team had recorded its solitary home defeat against Royal Challengers Bangalore followed by a defeat against CSK in Chennai. SRH pulled off a 1 run win against Rajasthan Royals at home with Bhuvneshwar Kumar defending 12 runs (needed for Rajasthan to clinch the win) and dismissing Rovman Powell on the final delivery off the match. The team then lost to Mumbai Indians in Mumbai. The team has returned to Hyderabad for their final 3 league games, the team has chased down Lucknow Super Giants total of 165 in 9.4 overs without losing a single wicket, followed by a washout against Gujarat Titans and have finished off the league stage with a win against Punjab Kings at home and ended at number 2 position in the table marking a return to playoffs after 4 years.</p>
                <p style={styles.paragraph}>The team played against Kolkata Knight Riders at Ahmedabad in Qualifier 1, which they lost by 8 wickets and played the qualifier 2 against Rajasthan Royals in Chennai, won the match by 36 runs and advanced to finals to play Kolkata Knight Riders in Chennai. The team ended the season as runners up with Kolkata Knight Riders winning by 8 wickets, the team has finished with 9 wins, 7 losses and 1 No result.</p>
                <div style={styles.imgs}>
                    <img src={images.ipl20243} style={styles.img} alt="" />
                </div>
            </div>

            <h2 style={styles.subHeading}>Notable Rivalries</h2>
            <div style={styles.highlight}>
                <p style={styles.paragraph}>There is a notable rivalry between Royal Challengers Bengaluru and the Hyderabad franchises, first with Deccan Chargers and now with Sunrisers Hyderabad. The clashes between Bengaluru and Hyderabad have been intense with the latter ultimately dominating the former. Deccan Chargers had won 6 out of the 11 clashes between the two and Sunrisers currently lead with 13 games to the 11 games won by RCB as per the latest edition. There is also a notable trend where the Hyderabad franchise has jeopardised RCB's campaigns in some way or the other. The 2009 Indian Premier League final was won by Deccan Chargers and the 2016 Indian Premier League final was won by Sunrisers Hyderabad. Their 2020 clash was also at a high-stake eliminator, where a fifty by Kane Williamson trumped RCB to knock them out of IPL 2020. Even with their abysmal 2021 season, SRH were able to beat a rising RCB. RCB had the opportunity to reach the top 2 but ended up in 3rd place, forcing them to play the eliminator, where they eventually lost to KKR, knocking them out of IPL 2021. RCB's 2022 IPL campaign was also affected by SRH, whom they lost to by 9 wickets after scoring 68 in their first encounter, putting them under pressure because of their negative run rate throughout their otherwise strong campaign.</p>
                <p style={styles.paragraph}>In the latest chapter of the rivalry between the two in IPL 2024, like the Kolkata Knight Riders, Sunrisers Hyderabad were the first to break the 263-run record set by RCB, which seemed insurmountable at the time as a result of Chris Gayle's 175. In a more humiliating turn, SRH again broke RCB's record against RCB themselves on their home ground, scoring 287 runs, thanks to a 39-ball century by Travis Head and a 30-ball 67 by Heinrich Klassen. Although there was a valiant effort by RCB, spearheaded by Dinesh Karthik's 83 off 35 and captain Faf du Plessis's 62 off 28, RCB still lost by 25 runs.[60] The loss also worsened RCB's already unfavourable odds in their dismal IPL 2024 to qualify for the playoffs. SRH would break RCB's 263 record for the third time and score 266 against the Delhi Capitals after setting an all-time T20 record by scoring 125 runs inside the power-play.</p>
            </div>

            <h2 style={styles.subHeading}>Join the Orange Army Fans Community</h2>
            <div style={styles.highlight}><p style={styles.paragraph}>Experience the Best Cricketing Experiences by following our Website and our Social Media Platforms , To community and know more Facts about One of the Best IPL Teams And Its Legacy.</p></div>

            <p style={styles.thankYou}>Thank you for joining us on this exiciting cricketing journey with Cricmawa . Let&apos;s explore and celebrate the limitless Entertainment of Unlimited cricketing action together.</p>
        </div>
    );
}


