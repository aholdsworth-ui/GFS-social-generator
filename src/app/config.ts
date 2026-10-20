export type CohortId = "forum" | "cloud" | "accelerator";

export interface Cohort {
  id: CohortId;
  name: string;
  backgroundHex: string;
  textColor: string;
  cropRule: string;
  assets: {
    motion: string;
    static1: string;
    static2: string;
  };
  headlines: string[];
  supportingText: string | null;
  hasClasses: boolean;
  classes?: string[];
  supportingTextOptions?: string[];
}

export const brandColors = {
  grey1200: "#121317",
  text: "#FFFFFF"
};

export const cohorts: Cohort[] = [
  {
    id: "forum",
    name: "Forum",
    backgroundHex: brandColors.grey1200,
    textColor: brandColors.text,
cropRule: "object-cover scale-[2.2] translate-x-[50%] -translate-y-[50%]",
    assets: {
      motion: "/assets/GFS_Connect Momentum Expression_Grey 1200_1920x1080.mp4",
      static1: "/assets/GFS_Connect Momentum Expression_Grey 1200_Large_RGB_01.jpg",
      static2: "/assets/GFS_Connect Momentum Expression_Grey 1200_Large_RGB_02.jpg"
    },
    headlines: [
      "We're off to Mountain View!",
      "Connecting with experts and top AI founders"
    ],
    supportingText: "November 4–5",
    hasClasses: false
  },
  {
    id: "cloud",
    name: "Cloud Program",
    backgroundHex: brandColors.grey1200,
    textColor: brandColors.text,
    cropRule: "object-cover object-[100%_50%] scale-125", 
    assets: {
      motion: "/assets/GFS_Build Momentum Expression_Grey 1200_1920x1080_MP4 (HR).mp4",
      static1: "/assets/GFS_Build Momentum Expression_Grey 1200_02.jpg",
      static2: "/assets/GFS_Build Momentum Expression_Grey 1200_03.jpg"
    },
    headlines: [
      "We're building faster",
      "I'm building faster",
      "Building faster, scaling earlier"
    ],
    supportingText: null,
    hasClasses: false
  },
  {
    id: "accelerator",
    name: "Accelerator",
    backgroundHex: brandColors.grey1200,
    textColor: brandColors.text,
    cropRule: "object-cover object-[100%_100%] scale-150", 
    assets: {
      motion: "/assets/GFS_Scale Momentum Expression_Grey 1200_8192x5905.mp4",
      static1: "/assets/GFS_Scale Momentum Expression_Grey 1200_RGB_02.jpg",
      static2: "/assets/GFS_Scale Momentum Expression_Grey 1200_RGB_03.jpg"
    },
    headlines: [], 
    supportingText: null, 
    classes: [
      "Brazil", "Canada", "North America", "Spanish-speaking Latin America", "United States", 
      "Africa", "Europe and Israel", "Middle East, North Africa, Turkey", "South Africa", 
      "Australia and New Zealand", "India", "Japan", "Korea", "Singapore", "Southeast Asia" 
    ],
    supportingTextOptions: [
      "Selected to scale faster",
      "We're scaling faster"
    ],
    hasClasses: true
  }
];