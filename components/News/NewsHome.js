const STORIES = [
    {
        image: 'https://static.cricketaddictor.com/images/SRH.jpg?q=80',
        title: 'Bowling Failure or Batting?',
        lines: [
            "Shami , Nitish have been a minus this season",
            "Batting looked confused after LSG's Second Game",
            "Risers made a great comeback at the end",
            "Harsh , Aniket , Zeeshan , Malinga are find of the season",
        ],
        featured: true,
    },
    {
        image: 'https://images.mykhel.com/img/2025/03/ishan-kishan-srh-ft-1742092253.jpg',
        title: 'Ishan & Nitish misfired',
        lines: ["After Ishan kishan's century in the first game ishan looked clueless till RCB's Game and Nitish was low in confidence"],
    },
    {
        image: 'https://akm-img-a-in.tosshub.com/indiatoday/images/story/202505/mohammed-shami-ap-photo-12265746-16x9_0.jpg?VersionId=Lomk8lqptOVFE5tjEpjqNxK0d4mPrJYx&size=690:388',
        title: 'Shami\'s Future Doubtful in ornage ?',
        lines: ["With the kind of form shami is having and the price tag he carries it looks difficult to retain shami for next year"],
    },
];

const NewsHome = () => {
    const [featured, ...rest] = STORIES;
    return (
        <div className="bg-surface border-y border-border p-4">
            <div className="flex border-b border-border w-full mb-2">
                <div className="flex font-display text-lg sm:text-xl text-accent p-2 px-4 sm:px-8 border-r border-border">
                    Top Stories
                </div>
                <div className="flex font-display text-lg sm:text-xl text-text p-2 px-4 sm:px-6">
                    Risers News For You
                </div>
            </div>

            <div className="flex flex-col lg:flex-row flex-wrap rounded-xl p-2 sm:p-4 gap-4">
                <div className="flex flex-col sm:flex-row flex-1 p-2 sm:p-6 gap-4 lg:border-r border-border">
                    <div className="w-full sm:w-[16vw] h-[22vh] sm:h-[22vh]">
                        <img
                            className="w-full h-full rounded-xl object-cover shadow-md border border-border"
                            src={featured.image}
                            alt=""
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <h1 className="text-2xl sm:text-3xl font-display text-text uppercase">
                            {featured.title}
                        </h1>
                        <div className="text-base sm:text-lg font-medium text-textMuted space-y-2">
                            {featured.lines.map((line) => <p key={line}>{line}</p>)}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col w-full lg:w-[38vw] gap-4 lg:pl-4">
                    {rest.map((story) => (
                        <div key={story.title} className="flex gap-4 p-2">
                            <div className="w-[30vw] sm:w-[14vw] h-[12vh] shrink-0">
                                <img
                                    className="w-full h-full rounded-xl object-cover shadow-md border border-border"
                                    src={story.image}
                                    alt=""
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <h1 className="font-display text-lg sm:text-xl uppercase text-text">
                                    {story.title}
                                </h1>
                                <p className="text-textMuted text-sm sm:text-base font-medium">
                                    {story.lines[0]}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NewsHome;
