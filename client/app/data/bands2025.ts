export interface BandMember {
  id: number;
  name: string;
  instrument: string;
  image: string;
}

export interface Band {
  id: number;
  name: string;
  image: string;
  description: string;
  members: BandMember[];
}

export const bands: Band[] = [
  {
    id: 1,
    name: "The 4th Floor",
    image: "/bands/The 4th Floor.JPG",
    // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FRhythmPulse.png?alt=media&token=8c0def2a-1ca1-42ae-aca4-4654f6a7d4a5",
    description: "A fusion band that blends rock, pop, and electronic elements. Known for their energetic performances and innovative arrangements.",
    members: [
      { 
        id: 1, 
        name: "Anuj", 
        instrument: "Rhythm Guitar", 
        image: "/bands/RhythmPulse/Anuj.jpg",
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FRhythmPulse%2FAnuj.jpg?alt=media&token=702d18a5-bec8-4bb4-8186-a869f1dd0e71"
      },
      { 
        id: 2, 
        name: "Ayushya", 
        instrument: "Lead Guitar", 
        image: "/bands/RhythmPulse/Ayushya.jpg",
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FRhythmPulse%2FAyushya.jpg?alt=media&token=d3489bdf-06e7-4568-a441-6f11a1428dfc"
      },
      { 
        id: 3, 
        name: "Harini", 
        instrument: "Lead Vocals", 
        image: "/bands/RhythmPulse/Harini.jpg",
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FRhythmPulse%2FHarini.jpg?alt=media&token=a170fbed-17e2-4637-abb1-10293fc7799e"
      },
      { 
        id: 4, 
        name: "Priyansu", 
        instrument: "Lead Vocals", 
        image: "/bands/RhythmPulse/Priyansu.jpg",
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FRhythmPulse%2FPriyansu.jpg?alt=media&token=bbb250eb-79d0-4ecf-88f0-9b0c0f608dd8"
      },
      { 
        id: 5, 
        name: "Varsha", 
        instrument: "Keyboard", 
        image: "/bands/RhythmPulse/Varsha1.jpg",
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FRhythmPulse%2FVarsha1.jpg?alt=media&token=7119fc8d-5e43-4002-b3e0-0703641a46cc"
      },
      { 
        id: 6, 
        name: "Yashas", 
        instrument: "Drums", 
        image: "/bands/RhythmPulse/Yashas.jpg",
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FRhythmPulse%2FYashas.jpg?alt=media&token=65adc72d-977e-465b-93ac-66f6f2875577"
      }
    ],
  },
  {
    id: 2,
    name: "Harmonic Horizon",
    image: "/bands/HarmonicHorizon.png",
    // image: "",
    description: "An indie folk ensemble that creates soulful melodies with acoustic instruments. Their music tells stories of life, love, and adventure.",
    members: [
      { 
        id: 1, 
        name: "Abhinay", 
        instrument: "Drums", 
        image: "/bands/HarmonicHorizon/Abhinay.jpg",
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FHarmonicHorizon%2FAbhinay.jpg?alt=media&token=ee4b5429-e486-4b66-a90e-a8c853f994ce"
      },
      { 
        id: 2, 
        name: "Asish", 
        instrument: "Acoustic Guitar/Vocals", 
        image: "/bands/HarmonicHorizon/Asish.jpg" 
        // image: ""
      },
      { 
        id: 3, 
        name: "Dhriti J N", 
        instrument: "Lead Vocals", 
        image: "/bands/HarmonicHorizon/Dhriti.jpg",
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FHarmonicHorizon%2FDhriti.jpg?alt=media&token=b9de26c9-003f-46cf-ac5f-89f792bd3abf"
      },
      { 
        id: 4, 
        name: "Gokul", 
        instrument: "Keyboard", 
        image: "/bands/HarmonicHorizon/Gokul.jpg",
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FHarmonicHorizon%2FGokul.jpg?alt=media&token=e108e46e-c8de-41c7-b5d6-66dc118e42b4"
      },
      { 
        id: 5, 
        name: "Shashwat", 
        instrument: "Lead Vocals", 
        image: "/bands/HarmonicHorizon/Shashwat.jpg",
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FHarmonicHorizon%2FShashwat.jpg?alt=media&token=4169066f-f661-429e-b491-263233059874"
      },
      { 
        id: 6, 
        name: "Shruthi Pullela", 
        instrument: "Electric Guitar/Vocals", 
        image: "/bands/HarmonicHorizon/Shruthi.jpg"
        // image: "" 
      }
    ],
  },
  {
    id: 3,
    name: "Soul Rock",
    // image: "/bands/SoulRock.png",
    image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FSoulRock.png?alt=media&token=b16ad4a0-ded5-47a6-9053-b6f0f61e8d62",
    description: "A powerhouse rock ensemble that masterfully blends classic rock anthems with contemporary alternative vibes. Their dynamic stage presence and tight harmonies create an unforgettable live experience.",
    members: [
      { 
        id: 1, 
        name: "Abhishek", 
        instrument: "Drums", 
        image: "/bands/SoulRock/AbhishekKumar.jpg",
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FSoulRock%2FAbhishekKumar.jpg?alt=media&token=6d04280e-06c1-486f-90bd-8ba0be7c4ddd"
      },
      { 
        id: 2, 
        name: "David J Sharon", 
        instrument: "Mixer", 
        image: "/bands/SoulRock/David.png",
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FSoulRock%2FDavid.png?alt=media&token=1f81c5bc-ac05-490d-82c4-13a11b5b0a9d"
      },
      { 
        id: 3, 
        name: "Gladwin John", 
        instrument: "Lead Vocals", 
        image: "/bands/SoulRock/John.jpg",
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FSoulRock%2FJohn.jpg?alt=media&token=e31b3253-6ac4-4ade-b7e9-3bc3efb20f3d"
      },
      { 
        id: 4, 
        name: "Meera R", 
        instrument: "Lead Vocals", 
        image: "/bands/SoulRock/MeeraR.jpg",
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FSoulRock%2FMeeraR.jpg?alt=media&token=13328b8d-02b2-47a6-b679-6107724a62ea"
      },
      { 
        id: 5, 
        name: "Harith Y", 
        instrument: "Lead Keyboard", 
        image: "/bands/SoulRock/Harith.jpg",
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FSoulRock%2FHarith.jpg?alt=media&token=0f191ee8-d733-42bd-9dbf-6b9a029153ef"
      },
      { 
        id: 6, 
        name: "Shriya Y", 
        instrument: "Harmonizing Vocals", 
        image: "/bands/SoulRock/Shriya.jpg",
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FSoulRock%2FShriya.jpg?alt=media&token=2f937576-09c9-4359-9cf9-2835b372c85d"
      },
      { 
        id: 7, 
        name: "Pavan", 
        instrument: "Lead Vocals", 
        image: "/bands/SoulRock/Pavan.jpg",
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FSoulRock%2FPavan.jpg?alt=media&token=3b2ed054-76e2-464f-b163-a342b5e349d9"
      },
      { 
        id: 8, 
        name: "Priyank Jain", 
        instrument: "Rhythm Guitar", 
        image: "/bands/SoulRock/Priyank.jpg",
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FSoulRock%2FPriyank.jpg?alt=media&token=3f94036c-3f62-4d0e-93a0-33553aab8e50"
      },
      { 
        id: 9, 
        name: "Tarun", 
        instrument: "Rhythm Keyboard", 
        image: "/bands/SoulRock/Tarun.jpg",
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FSoulRock%2FTarun.jpg?alt=media&token=2742420e-1761-48c9-90f9-22ee616dfa50"
      }
    ],
  },
  {
    id: 4,
    name: "Dream Pie",
    image: "/bands/DreamPie.png",
    // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FDreamPie.png?alt=media&token=2789a287-56db-4d10-bf92-6eff505cbd73",
    description: "An innovative rock collective that pushes musical boundaries by fusing progressive rock elements with modern indie sensibilities. Their experimental approach and technical precision set them apart.",
    members: [
      { 
        id: 1, 
        name: "Adi Khera", 
        instrument: "Rhythm Guitar", 
        image: "/bands/DreamPie/Adi.jpg",
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FDreamPie%2FAdi.jpg?alt=media&token=499702fe-3f30-4691-b6de-1d2adaa17f73"
      },
      { 
        id: 2, 
        name: "Bhadresh", 
        instrument: "Lead Vocals", 
        image: "/bands/DreamPie/Bhadresh.jpg",
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FDreamPie%2FBhadresh.jpg?alt=media&token=f4d32ad2-10f6-45cd-95c3-a015928d2595"
      },
      { 
        id: 3, 
        name: "Dikshant", 
        instrument: "Drums", 
        image: "/bands/DreamPie/Dikshant.jpg",
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FDreamPie%2FDikshant.jpg?alt=media&token=6139a744-69c3-4c57-a565-c22c9bd48a95"
      },
      { 
        id: 4, 
        name: "Omkar Anand", 
        instrument: "Lead Guitar", 
        image: "/bands/DreamPie/Omkar.jpg",
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FDreamPie%2FOmkar.jpg?alt=media&token=9ffccaf1-999b-4a08-8e30-41c30ae75b44"
      },
      { 
        id: 5, 
        name: "Rohan Joshi", 
        instrument: "Keyboard/Lead Vocals", 
        image: "/bands/DreamPie/Rohan.jpg",
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FDreamPie%2FRohan.jpg?alt=media&token=18b2474e-9187-4539-9e84-80ff79b93720"
      },
      { 
        id: 6, 
        name: "Shirish Giroti", 
        instrument: "Lead Vocals", 
        image: "/bands/DreamPie/Shirish.jpg",
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FDreamPie%2FShirish.jpg?alt=media&token=15f15bd4-c99b-4af1-a4a4-52cabd99523d"
      },
    ],
  },
  {
    id: 5,
    name: "Paradise",
    image: "/bands/Paradise.png",
    // image: "",
    description: "A versatile rock outfit that seamlessly transitions between classic rock ballads and contemporary alternative hits. Their polished performances and charismatic stage presence captivate audiences.",
    members: [
      { 
        id: 1, 
        name: "Abhishek", 
        instrument: "Lead Vocals", 
        image: "/bands/Paradise/AbhishekN.jpg",
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FParadise%2FAbhishekN.jpg?alt=media&token=c56efcfc-0449-43a4-adb0-1d142456641d"
      },
      { 
        id: 2, 
        name: "Chaitanya", 
        instrument: "Drums", 
        image: "/bands/Paradise/Chaitanya.jpg",
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FParadise%2FChaitanya.jpg?alt=media&token=fc0f0124-4962-459f-a894-8a5a796f3da1"
      },
      { 
        id: 3, 
        name: "Daniel", 
        instrument: "Rhythm Keyboard", 
        image: "/bands/Paradise/Daniel.jpg",
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FParadise%2FDaniel.jpg?alt=media&token=55d20b85-cb5c-4f93-853a-a723e37fbd3f"
      },
      { 
        id: 4, 
        name: "Manoj", 
        instrument: "Lead Keyboard", 
        image: "/bands/Paradise/Manoj.jpg",
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FParadise%2FManoj.jpg?alt=media&token=7f8a9998-2132-4539-a020-f5505a1ab219"
      },
      { 
        id: 5, 
        name: "Rittik", 
        instrument: "Flute", 
        image: "/bands/Paradise/Rittik.jpg",
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FParadise%2FRittik.jpg?alt=media&token=70389613-bf2d-4200-bfd2-1e31a0c7c8ef"
      },
      { 
        id: 6, 
        name: "Vivek", 
        instrument: "Rhythm Guitar", 
        image: "/bands/Paradise/Vivek.jpg",
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FParadise%2FVivek.jpg?alt=media&token=2c2b0dd4-02f5-491e-a9b3-6ec6f3b7d9a1"
      },
    ],
  },
  {
    id: 6,
    name: "Just For You All",
    image: "/bands/JustForYouAll.png",
    // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FJustForYouAll.png?alt=media&token=0d192f9f-b9c6-412e-8907-a2f9b39a6256",
    description: "A dynamic rock ensemble that delivers high-octane performances with a perfect blend of classic rock energy and modern alternative edge. Their infectious enthusiasm and crowd interaction make every show memorable.",
    members: [
      { 
        id: 1, 
        name: "Abhishek", 
        instrument: "Lead Vocals", 
        image: "/bands/JustForYouAll/AbhishekN.jpg",
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FJustForYouAll%2FAbhishekN.jpg?alt=media&token=6d3ccd36-fbb2-4698-aff4-07b3b496045b"
      },
      { 
        id: 2, 
        name: "Shirish", 
        instrument: "Lead Vocals", 
        image: "/bands/JustForYouAll/Shirish.jpg",
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FJustForYouAll%2FShirish.jpg?alt=media&token=93195261-6fda-467a-af3e-73cefe37d443"
      },
      { 
        id: 3, 
        name: "Chaitanya", 
        instrument: "Drums", 
        image: "/bands/JustForYouAll/Chaitanya.jpg",
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FJustForYouAll%2FChaitanya.jpg?alt=media&token=dbc89d11-c4bf-4751-84f9-3f182f95f5f1"
      },
      { 
        id: 4, 
        name: "Seimen", 
        instrument: "Backing Vocals/Lead Guitar", 
        image: "/bands/JustForYouAll/Seimen.jpg",
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FJustForYouAll%2FSeimen.jpg?alt=media&token=dcef3a4c-aa55-4b1f-a72f-6bbb5f790509"
      },
      { 
        id: 5, 
        name: "Vivek", 
        instrument: "Backing Vocals/Rhythm Guitar", 
        image: "/bands/JustForYouAll/Vivek.jpg",
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FJustForYouAll%2FVivek.jpg?alt=media&token=e1621509-aa6d-4df2-8e2e-21c8dc958ce2"
      },
      { 
        id: 6, 
        name: "Daniel", 
        instrument: "Keyboard", 
        image: "/bands/JustForYouAll/Daniel.jpg",
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FJustForYouAll%2FDaniel.jpg?alt=media&token=94c8620c-3da6-43d8-b459-4dcb0528c584"
      },
    ]
  },
  {
    id: 7,
    name: "Melody Waves",
    image: "/bands/MelodyWaves.png",
    // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FMelodyWaves.png?alt=media&token=387e42ad-390f-473b-a439-88b6e8199b83",
    description: "A vocal-driven ensemble that creates waves of harmony with their multiple lead vocalists. Their sound is characterized by rich vocal arrangements, supported by dynamic keyboard work and rhythmic guitar patterns.",
    members: [
      { 
        id: 1, 
        name: "Anushree", 
        instrument: "Lead Vocals", 
        image: "/bands/MelodyWaves/Anushree.jpg",
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FMelodyWaves%2FAnushree.jpg?alt=media&token=84024f86-a235-4ef1-b5e3-32cbc17b18fd"
      },
      { 
        id: 2, 
        name: "Ayushyaa", 
        instrument: "Rhythm Guitar", 
        image: "/bands/MelodyWaves/Ayushya.jpg",
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FMelodyWaves%2FAyushya.jpg?alt=media&token=392581c2-ea59-4f34-86dd-1e407a95f964"
      },
      { 
        id: 3, 
        name: "Dhanya", 
        instrument: "Lead Vocals", 
        image: "/bands/MelodyWaves/Dhanya.jpg",
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FMelodyWaves%2FDhanya.jpg?alt=media&token=337bd8d4-90b0-4805-bcba-6e82c2323493"
      },
      { 
        id: 4, 
        name: "Harini", 
        instrument: "Lead Vocals", 
        image: "/bands/MelodyWaves/Harini.jpg",
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FMelodyWaves%2FHarini.jpg?alt=media&token=a38b4748-fd36-4724-8d31-572b14bc0fb9"
      },
      { 
        id: 5, 
        name: "Harith", 
        instrument: "Keyboard/Lead Vocals", 
        image: "/bands/MelodyWaves/Harith.jpg",
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FMelodyWaves%2FHarith.jpg?alt=media&token=face46b4-704c-4863-bbca-b038c34112e5"
      },
      { 
        id: 6, 
        name: "Yashas", 
        instrument: "Drums", 
        image: "/bands/MelodyWaves/Yashas.jpg",
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FMelodyWaves%2FYashas.jpg?alt=media&token=0cfa8fb0-3853-4bc7-ad5a-c1e683ca3858"
      },
    ]
  },
  {
    id: 8,
    name: "Dosa",
    image: "/bands/Dosa.png",
    // image: "",
    description: "A contemporary fusion band that blends multiple vocal styles with modern instrumentation. Their performances feature a unique mix of lead and harmonizing vocals, supported by dynamic keyboard and guitar arrangements.",
    members: [
      { 
        id: 1, 
        name: "Adi Khera", 
        instrument: "Guitar", 
        image: "/bands/Dosa/Adi.jpg",
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FDosa%2FAdi.jpg?alt=media&token=fa0271ed-fe7c-47f7-8efb-705383334c79"
      },
      { 
        id: 2, 
        name: "Dharani", 
        instrument: "Lead Vocals", 
        image: "/bands/Dosa/Dharani.png",
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FDosa%2FDharani.png?alt=media&token=5a35ff7f-ee46-4e32-a185-f546004671d1"
      },
      { 
        id: 3, 
        name: "Dikshant", 
        instrument: "Drums", 
        image: "/bands/Dosa/Dikshant.jpg",
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FDosa%2FDikshant.jpg?alt=media&token=14faf71a-37e8-4577-8fe1-4d6d223502bf"
      },
      { 
        id: 4, 
        name: "Divyaa", 
        instrument: "Lead Vocals", 
        image: "/bands/Dosa/Divyaa.jpg",
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FDosa%2FDivyaa.jpg?alt=media&token=bc360b4b-dbc8-4aaa-8d5e-7f2a2ff589b7"
      },
      { 
        id: 5, 
        name: "Gladwin John", 
        instrument: "Keyboard", 
        image: "/bands/Dosa/John.jpg",
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FDosa%2FJohn.jpg?alt=media&token=4cf02d86-f08d-4fe1-984a-0ed12195e2c6"
      },
      { 
        id: 6, 
        name: "Meera K", 
        instrument: "Harmonizing Vocals", 
        image: "/bands/Dosa/MeeraK.jpg",
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FDosa%2FMeeraK.jpg?alt=media&token=d8933e1a-e39b-48ea-8077-d48aa506c683"
      },
      { 
        id: 7, 
        name: "Shriya", 
        instrument: "Harmonizing Vocals", 
        image: "/bands/Dosa/Shriya.jpg",
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FDosa%2FShriya.jpg?alt=media&token=3bdfd8e0-37b4-40de-be58-24f808eb25d1"
      },
      {
        id: 8,
        name: "Saarang",
        instrument: "Tambourine and Mridangam",
        image: "/bands/Dosa/Saarang.jpg",
        // image: ""
      }
    ]
  },
  {
    id: 9,
    name: "Accord",
    image: "/bands/Accord.png",
    // image: "",
    description: "A contemporary fusion band that blends multiple vocal styles with modern instrumentation. Their performances feature a unique mix of lead and harmonizing vocals, supported by dynamic keyboard and guitar arrangements.",
    members: [
      { 
        id: 1, 
        name: "Jahnavi", 
        instrument: "Lead Vocals", 
        image: "/bands/Accord/Jahnavi.jpg", 
        // image: ""
      },
      { 
        id: 2, 
        name: "Shashwat", 
        instrument: "Drums", 
        image: "/bands/Accord/Shashwat.jpg",
        // image: ""
      },
      { 
        id: 3, 
        name: "Rupkatha", 
        instrument: "Lead Vocals", 
        image: "/bands/Accord/Rupkatha.jpg", 
        // image: ""
      },
      { 
        id: 4, 
        name: "Keshav", 
        instrument: "Keyboard", 
        image: "/bands/Accord/Keshav.jpg",
        // image: "" 
      },
      { 
        id: 5, 
        name: "Bhadresh", 
        instrument: "Lead Vocals", 
        image: "/bands/Accord/Bhadresh.jpg",
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FAccord%2FBhadresh.jpg?alt=media&token=cbc6c930-67be-46d0-bd71-59d4514f046a"
      },
      { 
        id: 6, 
        name: "Caitlin", 
        instrument: "Lead Vocals",
        image: "/bands/Accord/Caitlin.jpg", 
        // image: ""
      },
    ]
  },
  {
    id: 10,
    name: "Sanchari",
    image: "/bands/Sanchari.png",
    // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FSanchari.png?alt=media&token=d842b00c-93a0-4a95-ad55-619c48c03c6a",
    description: "A versatile rock collective that masterfully combines traditional rock elements with contemporary alternative influences. Their powerful stage presence and musical versatility create an immersive concert experience.",
    members: [
      { 
        id: 1, 
        name: "Chaitanya", 
        instrument: "Drums", 
        image: "/bands/Sanchari/Chaitanya.jpg",
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FSanchari%2FChaitanya.jpg?alt=media&token=feaa5b2a-ef21-4bfc-8a7b-f6d8bd97326a"
      },
      { 
        id: 2, 
        name: "Harith", 
        instrument: "Keyboard", 
        image: "/bands/Sanchari/Harith.jpg",
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FSanchari%2FHarith.jpg?alt=media&token=0bfa2f6c-f6f9-46ae-bfcb-6c26406d8fcd" 
      },
      { 
        id: 3, 
        name: "Vineela", 
        instrument: "Lead Vocals", 
        image: "/bands/Sanchari/Vineela1.jpg",
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FSanchari%2FVineela1.jpg?alt=media&token=e14fb64f-8dbb-4fdf-8ba7-4287b67dc434"
      },
      { 
        id: 4, 
        name: "Veni", 
        instrument: "Lead Vocals", 
        image: "/bands/Sanchari/Veni.jpg" ,
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FSanchari%2FVeni.jpg?alt=media&token=00e5892c-ac55-4833-9958-9109a8380407"
      },
      { 
        id: 5, 
        name: "Bhadresh", 
        instrument: "Lead Vocals", 
        image: "/bands/Sanchari/Bhadresh.jpg",
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FSanchari%2FBhadresh.jpg?alt=media&token=41ef546f-7ccd-490b-987d-80f4811ed773"
      },
      { 
        id: 6, 
        name: "Grishmank", 
        instrument: "Rhythm Guitar", 
        image: "/bands/Sanchari/Grishmank.jpg" 
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FSanchari%2FGrishmank.jpg?alt=media&token=459629a0-47c3-46e9-b301-6a5173521b59"
      },
      { 
        id: 7, 
        name: "Vijay", 
        instrument: "Lead Vocals", 
        image: "/bands/Sanchari/Vijay.jpg" 
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FSanchari%2FVijay.jpg?alt=media&token=086a7e52-5033-421c-a908-999032c1f1aa"
      },
      { 
        id: 8, 
        name: "Ajitha Arvindh", 
        instrument: "Lead Vocals", 
        image: "/bands/Sanchari/Ajitha.jpg" 
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FSanchari%2FAjitha.jpg?alt=media&token=00e5892c-ac55-4833-9958-9109a8380407"
      },

      { 
        id: 9, 
        name: "Srinivas Nithin", 
        instrument: "Lead Vocals", 
        image: "/bands/Sanchari/SrinivasNithin.jpg" 
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FSanchari%2FSrinivasNithin.jpg?alt=media&token=bed67cb5-ee6d-40ff-8b19-c6d34cfe5362"
      },
      { 
        id: 10, 
        name: "Ashish Nathan", 
        instrument: "Rhythm Guitar", 
        image: "/bands/Sanchari/AshishNathan.jpg",
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FSanchari%2FAshishNathan.jpg?alt=media&token=7222d022-612c-4f2d-9ff7-50b875b105fb"
      },

      { 
        id: 11, 
        name: "Manoj", 
        instrument: "Keyboard", 
        image: "/bands/Sanchari/Manoj.jpg" 
        // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FSanchari%2FManoj.jpg?alt=media&token=ff043870-cebf-4517-9b6b-3e0f56d88006"
      },
      { 
        id: 12, 
        name: "Srinidhi", 
        instrument: "Lead Vocals", 
        image: "/bands/Sanchari/Srinidhi.jpg",
        // image: ""
      },
    ]
  },
];

export const merakiBands: Band[] = [
  {
    id: 1,
    name: "SOULROCK",
    image: "/bands/SoulRock.png",
    // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FSoulRock.png?alt=media&token=b16ad4a0-ded5-47a6-9053-b6f0f61e8d62",
    description: "A high-energy rock band that combines classic rock influences with modern alternative sounds.",
    members: []
  },
  {
    id: 2,
    name: "DreamPie",
    image: "/bands/DreamPie.png",
    // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FDreamPie.png?alt=media&token=2789a287-56db-4d10-bf92-6eff505cbd73",
    description: "A high-energy rock band that combines classic rock influences with modern alternative sounds.",
    members: []
  },
  {
    id: 3,
    name: "Just For You All",
    image: "/bands/JustForYouAll.png",
    // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FJustForYouAll.png?alt=media&token=0d192f9f-b9c6-412e-8907-a2f9b39a6256",
    description: "A high-energy rock band that combines classic rock influences with modern alternative sounds.",
    members: []
  },
  {
    id: 4,
    name: "Rhythm Pulse",
    image: "/bands/RhythmPulse.png",
    // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FRhythmPulse.png?alt=media&token=8c0def2a-1ca1-42ae-aca4-4654f6a7d4a5",
    description: "A fusion band that blends rock, pop, and electronic elements.",
    members: []
  },
  {
    id: 5,
    name: "Melody Waves",
    image: "/bands/MelodyWaves.png",
    // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FMelodyWaves.png?alt=media&token=387e42ad-390f-473b-a439-88b6e8199b83",
    description: "A high-energy rock band that combines classic rock influences with modern alternative sounds.",
    members: []
  },
  {
    id: 6,
    name: "Sanchari",
    image: "/bands/Sanchari.png",
    // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Bands%2FSanchari.png?alt=media&token=d842b00c-93a0-4a95-ad55-619c48c03c6a",
    description: "A high-energy rock band that combines classic rock influences with modern alternative sounds.",
    members: []
  }
]; 

