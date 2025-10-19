import { Event } from './events2024';

export const pastEvents: Event[] = [
    {
    id: 5,
    title: "Meraki (Club Performance)",
    date: "October 10, 2025",
    time: "8:00 PM",
    location: "Basket Ball Court",
    description: "Perfomance for the Inaugration of Our Intra College Fest",
    image: "/events/events2025-26/Meraki_2025/Meraki_1.jpg",
    category: "Performances",
    galleryRoute: "/2025events/meraki-2025",
    order: 5
  },
  {
    id: 4,
    title: "1st Open Mic Night",
    date: "September 9, 2025",
    time: "7:45 PM",
    location: "Music Room",
    description: "The inaugural open mic night, setting the stage for future musical collaborations.",
    image: "/events/events2025-26/Open_Mic_September_2025/OpenMicSeptember9.png",
    registrationLink: "https://docs.google.com/forms/d/e/1FAIpQLSfoGXRgP_tri8WNY1ISP3GE28etFzXQdqGSbWqAsaK05qXMQg/viewform",
    category: "Open Mics",
    galleryRoute: "/2025events/open_mic-sep-2025",
    order: 4
  },
  {
    id: 3,
    title: "Blastroduction (Club Performance)",
    date: "September 8, 2025",
    time: "7:00 PM",
    location: "H05",
    description: "A spectacular showcase introducing the Music Club's talent to the institute, featuring our finest performers and diverse musical styles.",
    image: "/events/events2025-26/Blastroduction_2025/Blastroduction_1.JPG",
    // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Events%2FEvents2025-26%2FMusic_Theory_Workshop_2025%2FMusicTheoryWorkshop2025.jpg?alt=media&token=9c98c712-183c-46f3-8909-93ced4f77cdf",
    category: "Performances",
    galleryRoute: "/2025events/blastroduction-2025",
    // youtubeUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    order: 3
  },
  {
    id: 2,
    title: "Ganesh Chaturthi (Club Performance)",
    date: "August 27, 2025",
    time: "2:00 PM",
    location: "Ashwatha Hostel",
    description: "Performance to celebrate the feastival of Lord Ganesha.",
    image: "/events/events2025-26/Ganesh_Chaturthi_2025/Ganesh Chaturthi.jpg",
    category: "Performances",
    galleryRoute: "/2025events/ganesh_chaturthi-2025",
    order: 2
  },
  {
    id: 1,
    title: "Independence Day (Club Performance)",
    date: "August 15, 2025",
    time: "8:30 AM",
    location: "Main Gate",
    description: "Patriotic performance to celebrate the Nation's Independence.",
    image: "/events/events2025-26/Independence_Day_2025/Independence Day2025_1.png",
    category: "Performances",
    galleryRoute: "/2025events/independence_day-2025",
    order: 1
  }  
];

export const upcomingEvents: Event[] = [
  {
    id: 2,
    title: "Winter Concert (Club Performance)",
    date: "October 5, 2025",
    time: "6:00 PM",
    location: "H05",
    description: "A grand musical finale to the year, featuring performances from all club sections.",
    image: "/events/events2025-26/Winter_Concert_2025/WinterConcert2025.jpg",
    // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Events%2FEvents2025-26%2FWinter_Concert_2025%2FWinterConcert2025.jpg?alt=media&token=47e09df5-f77f-479e-a0e2-c8e69a575edc",
    category: 'Performances' as const,
    // youtubeUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    galleryRoute: "/2025events/winter_concert-2025",
    order: 2
  },
  
  // {
  //   id: 1,
  //   title: "Onam (Club Performance)",
  //   date: "September 14, 2025",
  //   time: "8:00 PM",
  //   location: "Ashwatha Hostel",
  //   description: "Performance to celebrate the feastival of Onam.",
  //   image: "/events/events2025-26/Onam_2025/Onam2025.jpg",
  //   // image: "https://firebasestorage.googleapis.com/v0/b/music-club-app-802a6.firebasestorage.app/o/Events%2FEvents2025-26%2FJazz_Night_2025%2FJazzNight2025.jpg?alt=media&token=34cee50b-78b9-4fbc-a083-238610b2a008",
  //   category: 'Performances' as const,
  //   // youtubeUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  //   galleryRoute: "/2025events/onam-2025",
  //   order: 1
  // },
  
].map((item, index) => ({
  ...item,
  order: index,
  category: item.category as 'Performances' | 'Open Mics' | 'Competitions' | 'Workshops'
}));