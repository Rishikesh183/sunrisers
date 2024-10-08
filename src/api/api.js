// const API_KEY="9f0bd088-a0b2-454f-85ce-c5257ce5401a";
export const getMatchInfo=async ()=>{
    const url = `https://cricbuzz-live.vercel.app/v1/matches/recent`;
    try {
        const res = await fetch(url);
        return await res.json();
    } catch (err) {
        console.log(err);
    }
}

