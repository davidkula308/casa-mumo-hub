import gardenStudio from "@/assets/room-garden-studio.jpg";
import savannahSuite from "@/assets/room-savannah-suite.jpg";
import clayLoft from "@/assets/room-clay-loft.jpg";
import heroRoom from "@/assets/hero-room.jpg";
import ceramics from "@/assets/ceramics.jpg";
import eucalyptus from "@/assets/eucalyptus.jpg";

export const roomImages: Record<string, string> = {
  "garden-studio": gardenStudio,
  "savannah-suite": savannahSuite,
  "clay-loft": clayLoft,
  hero: heroRoom,
  ceramics,
  eucalyptus,
};

export function roomImage(key?: string | null) {
  return (key && roomImages[key]) || heroRoom;
}

export const galleryFor = (key?: string | null) => [
  roomImage(key),
  heroRoom,
  ceramics,
  eucalyptus,
];
