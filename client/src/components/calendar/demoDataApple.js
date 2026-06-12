import dayjs from "dayjs";

export const DEMO_IMAGES_APPLE = {
  Drake: "https://placehold.co/300x300/fa2d6e/ffffff?text=DR",
  "Taylor Swift": "https://placehold.co/300x300/fa233b/ffffff?text=TS",
  "The Weeknd": "https://placehold.co/300x300/ff5e57/ffffff?text=TW",
  "Daft Punk": "https://placehold.co/300x300/c34bff/ffffff?text=DP",
  Rosalía: "https://placehold.co/300x300/fa2d6e/ffffff?text=RO",
  Stromae: "https://placehold.co/300x300/fa233b/ffffff?text=ST",
  "Billie Eilish": "https://placehold.co/300x300/ff5e57/ffffff?text=BE",
  "Kendrick Lamar": "https://placehold.co/300x300/c34bff/ffffff?text=KL",
};

export const DEMO_ARTISTES_APPLE = [
  { id:"demo-1", name:"Drake", genres:["hip hop","rap"], images:[{url:DEMO_IMAGES_APPLE["Drake"]}] },
  { id:"demo-2", name:"Taylor Swift", genres:["pop","indie pop"], images:[{url:DEMO_IMAGES_APPLE["Taylor Swift"]}] },
  { id:"demo-3", name:"The Weeknd", genres:["r&b","pop"], images:[{url:DEMO_IMAGES_APPLE["The Weeknd"]}] },
  { id:"demo-4", name:"Daft Punk", genres:["electronic","house"], images:[{url:DEMO_IMAGES_APPLE["Daft Punk"]}] },
  { id:"demo-5", name:"Rosalía", genres:["latin","flamenco pop"], images:[{url:DEMO_IMAGES_APPLE["Rosalía"]}] },
  { id:"demo-6", name:"Stromae", genres:["chanson française","electronic"], images:[{url:DEMO_IMAGES_APPLE["Stromae"]}] },
  { id:"demo-7", name:"Billie Eilish", genres:["pop","alternative"], images:[{url:DEMO_IMAGES_APPLE["Billie Eilish"]}] },
  { id:"demo-8", name:"Kendrick Lamar", genres:["hip hop","conscious rap"], images:[{url:DEMO_IMAGES_APPLE["Kendrick Lamar"]}] },
];

export const DEMO_SORTIES_GLOBALES_APPLE = [
  { albumId:"d1", date:dayjs("2026-05-20"), titre:"Certified Lover Boy II", artiste:"Drake", type:"album", groupe:"album", lienSpotify:"https://music.apple.com", image:DEMO_IMAGES_APPLE["Drake"] },
  { albumId:"d2", date:dayjs("2026-05-23"), titre:"The Tortured Poets Vol. 2", artiste:"Taylor Swift", type:"album", groupe:"album", lienSpotify:"https://music.apple.com", image:DEMO_IMAGES_APPLE["Taylor Swift"] },
  { albumId:"d3", date:dayjs("2026-05-21"), titre:"Midnight Sun", artiste:"The Weeknd", type:"single", groupe:"single", lienSpotify:"https://music.apple.com", image:DEMO_IMAGES_APPLE["The Weeknd"] },
  { albumId:"d4", date:dayjs("2026-06-14"), titre:"Random Access Memories II", artiste:"Daft Punk", type:"album", groupe:"album", lienSpotify:"https://music.apple.com", image:DEMO_IMAGES_APPLE["Daft Punk"] },
  { albumId:"d5", date:dayjs("2026-06-18"), titre:"MOTOMAMI 2", artiste:"Rosalía", type:"album", groupe:"album", lienSpotify:"https://music.apple.com", image:DEMO_IMAGES_APPLE["Rosalía"] },
  { albumId:"d6", date:dayjs("2026-05-30"), titre:"Multitude II", artiste:"Stromae", type:"single", groupe:"single", lienSpotify:"https://music.apple.com", image:DEMO_IMAGES_APPLE["Stromae"] },
  { albumId:"d7", date:dayjs("2026-06-25"), titre:"HIT ME HARD AND SOFT 2", artiste:"Billie Eilish", type:"album", groupe:"album", lienSpotify:"https://music.apple.com", image:DEMO_IMAGES_APPLE["Billie Eilish"] },
  { albumId:"d8", date:dayjs("2026-06-28"), titre:"GNX Deluxe", artiste:"Kendrick Lamar", type:"album", groupe:"album", lienSpotify:"https://music.apple.com", image:DEMO_IMAGES_APPLE["Kendrick Lamar"] },
];

export const DEMO_GENRES_APPLE = {
  labels:["hip hop","pop","r&b","electronic","rap","latin","alternative","chanson française","house","indie pop"],
  datasets:[{ label:"Artistes", data:[8,7,5,4,6,3,3,2,2,2], backgroundColor:["#fa2d6e","#fa233b","#ff5e57","#c34bff","#ff7eb3","#ff9a6e","#d46bff","#fa5a7d","#b14bff","#ff6f91"], borderColor:"#000000", borderWidth:2 }],
};
