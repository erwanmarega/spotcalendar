import dayjs from "dayjs";

export const DEMO_IMAGES = {
  Drake: "https://placehold.co/300x300/8B5CF6/ffffff?text=DR",
  "Taylor Swift": "https://placehold.co/300x300/EC4899/ffffff?text=TS",
  "The Weeknd": "https://placehold.co/300x300/EF4444/ffffff?text=TW",
  "Daft Punk": "https://placehold.co/300x300/F59E0B/ffffff?text=DP",
  Rosalía: "https://placehold.co/300x300/10B981/ffffff?text=RO",
  Stromae: "https://placehold.co/300x300/3B82F6/ffffff?text=ST",
  "Billie Eilish": "https://placehold.co/300x300/84CC16/ffffff?text=BE",
  "Kendrick Lamar": "https://placehold.co/300x300/F97316/ffffff?text=KL",
};

export const DEMO_ARTISTES = [
  { id:"demo-1", name:"Drake", genres:["hip hop","rap"], images:[{url:DEMO_IMAGES["Drake"]}] },
  { id:"demo-2", name:"Taylor Swift", genres:["pop","indie pop"], images:[{url:DEMO_IMAGES["Taylor Swift"]}] },
  { id:"demo-3", name:"The Weeknd", genres:["r&b","pop"], images:[{url:DEMO_IMAGES["The Weeknd"]}] },
  { id:"demo-4", name:"Daft Punk", genres:["electronic","house"], images:[{url:DEMO_IMAGES["Daft Punk"]}] },
  { id:"demo-5", name:"Rosalía", genres:["latin","flamenco pop"], images:[{url:DEMO_IMAGES["Rosalía"]}] },
  { id:"demo-6", name:"Stromae", genres:["chanson française","electronic"], images:[{url:DEMO_IMAGES["Stromae"]}] },
  { id:"demo-7", name:"Billie Eilish", genres:["pop","alternative"], images:[{url:DEMO_IMAGES["Billie Eilish"]}] },
  { id:"demo-8", name:"Kendrick Lamar", genres:["hip hop","conscious rap"], images:[{url:DEMO_IMAGES["Kendrick Lamar"]}] },
];

export const DEMO_SORTIES_GLOBALES = [
  { albumId:"d1", date:dayjs("2026-05-20"), titre:"Certified Lover Boy II", artiste:"Drake", type:"album", groupe:"album", lienSpotify:"#", image:DEMO_IMAGES["Drake"] },
  { albumId:"d2", date:dayjs("2026-05-23"), titre:"The Tortured Poets Vol. 2", artiste:"Taylor Swift", type:"album", groupe:"album", lienSpotify:"#", image:DEMO_IMAGES["Taylor Swift"] },
  { albumId:"d3", date:dayjs("2026-05-21"), titre:"Midnight Sun", artiste:"The Weeknd", type:"single", groupe:"single", lienSpotify:"#", image:DEMO_IMAGES["The Weeknd"] },
  { albumId:"d4", date:dayjs("2026-06-14"), titre:"Random Access Memories II", artiste:"Daft Punk", type:"album", groupe:"album", lienSpotify:"#", image:DEMO_IMAGES["Daft Punk"] },
  { albumId:"d5", date:dayjs("2026-06-18"), titre:"MOTOMAMI 2", artiste:"Rosalía", type:"album", groupe:"album", lienSpotify:"#", image:DEMO_IMAGES["Rosalía"] },
  { albumId:"d6", date:dayjs("2026-05-30"), titre:"Multitude II", artiste:"Stromae", type:"single", groupe:"single", lienSpotify:"#", image:DEMO_IMAGES["Stromae"] },
  { albumId:"d7", date:dayjs("2026-06-25"), titre:"HIT ME HARD AND SOFT 2", artiste:"Billie Eilish", type:"album", groupe:"album", lienSpotify:"#", image:DEMO_IMAGES["Billie Eilish"] },
  { albumId:"d8", date:dayjs("2026-06-28"), titre:"GNX Deluxe", artiste:"Kendrick Lamar", type:"album", groupe:"album", lienSpotify:"#", image:DEMO_IMAGES["Kendrick Lamar"] },
];

export const DEMO_GENRES = {
  labels:["hip hop","pop","r&b","electronic","rap","latin","alternative","chanson française","house","indie pop"],
  datasets:[{ label:"Artistes", data:[8,7,5,4,6,3,3,2,2,2], backgroundColor:["#1DB954","#1ed760","#17a844","#148a38","#FFCE56","#FF6384","#36A2EB","#4BC0C0","#9966FF","#FF9F40"], borderColor:"#121212", borderWidth:2 }],
};
