// Workout Video Configuration
// This file manages all workout video URLs and metadata

export interface WorkoutVideo {
  id: string;
  title: string;
  description: string;
  duration: string;
  thumbnail?: string;
  localPath?: string; // For local videos in assets
  remoteUrl?: string; // For remote videos (YouTube, etc.)
  type: "local" | "remote";
}

export const workoutVideos: Record<string, WorkoutVideo> = {
  // Chest Exercises
  "bench-press": {
    id: "bench-press",
    title: "Bench Press Tutorial",
    description: "Learn proper bench press form and technique",
    duration: "3:45",
    type: "local",
    localPath: require("../assets/videos/bench.mp4"),
  },
  "dumbbell-fly": {
    id: "dumbbell-fly",
    title: "Dumbbell Fly Exercise",
    description: "Proper form for dumbbell fly exercise",
    duration: "2:30",
    type: "local",
    localPath: require("../assets/videos/dumbbellfly.mp4"),
  },
  "push-ups": {
    id: "push-ups",
    title: "Push-ups Tutorial",
    description: "Master the perfect push-up form",
    duration: "2:15",
    type: "local",
    localPath: require("../assets/videos/pushups.mp4"),
  },
  "incline-press": {
    id: "incline-press",
    title: "Incline Press Guide",
    description: "Upper chest development with incline press",
    duration: "3:20",
    type: "remote",
    remoteUrl: "https://www.youtube.com/watch?v=8iNEnVJ6qXk",
    thumbnail: "https://img.youtube.com/vi/8iNEnVJ6qXk/maxresdefault.jpg",
  },

  // Leg Exercises
  squats: {
    id: "squats",
    title: "Squat Form Tutorial",
    description: "Perfect your squat form and technique",
    duration: "4:10",
    type: "remote",
    remoteUrl: "https://www.youtube.com/watch?v=aclHkVaku9U",
    thumbnail: "https://img.youtube.com/vi/aclHkVaku9U/maxresdefault.jpg",
  },
  lunges: {
    id: "lunges",
    title: "Lunges Exercise Guide",
    description: "Proper lunge form and variations",
    duration: "2:45",
    type: "remote",
    remoteUrl: "https://www.youtube.com/watch?v=3XDriUn0udo",
    thumbnail: "https://img.youtube.com/vi/3XDriUn0udo/maxresdefault.jpg",
  },
  deadlifts: {
    id: "deadlifts",
    title: "Deadlift Tutorial",
    description: "Master the deadlift for strength gains",
    duration: "5:30",
    type: "remote",
    remoteUrl: "https://www.youtube.com/watch?v=1ZXobu7JvvE",
    thumbnail: "https://img.youtube.com/vi/1ZXobu7JvvE/maxresdefault.jpg",
  },
  "calf-raises": {
    id: "calf-raises",
    title: "Calf Raises Exercise",
    description: "Build strong calves with proper form",
    duration: "1:55",
    type: "remote",
    remoteUrl: "https://www.youtube.com/watch?v=JbyjNymZOt0",
    thumbnail: "https://img.youtube.com/vi/JbyjNymZOt0/maxresdefault.jpg",
  },

  // Shoulder Exercises
  "military-press": {
    id: "military-press",
    title: "Military Press Guide",
    description: "Overhead press for shoulder strength",
    duration: "3:15",
    type: "remote",
    remoteUrl: "https://www.youtube.com/watch?v=2yjwXTZQDDg",
    thumbnail: "https://img.youtube.com/vi/2yjwXTZQDDg/maxresdefault.jpg",
  },
  "lateral-raises": {
    id: "lateral-raises",
    title: "Lateral Raises Tutorial",
    description: "Isolate your lateral deltoids",
    duration: "2:20",
    type: "remote",
    remoteUrl: "https://www.youtube.com/watch?v=3VcKaXpzqRo",
    thumbnail: "https://img.youtube.com/vi/3VcKaXpzqRo/maxresdefault.jpg",
  },
  "front-raises": {
    id: "front-raises",
    title: "Front Raises Exercise",
    description: "Target your anterior deltoids",
    duration: "2:05",
    type: "remote",
    remoteUrl: "https://www.youtube.com/watch?v=gzDawZwVH9M",
    thumbnail: "https://img.youtube.com/vi/gzDawZwVH9M/maxresdefault.jpg",
  },

  // Back Exercises
  "pull-ups": {
    id: "pull-ups",
    title: "Pull-ups Tutorial",
    description: "Master pull-ups for back strength",
    duration: "4:25",
    type: "remote",
    remoteUrl: "https://www.youtube.com/watch?v=eGo4IYlbE5g",
    thumbnail: "https://img.youtube.com/vi/eGo4IYlbE5g/maxresdefault.jpg",
  },
  "bent-over-rows": {
    id: "bent-over-rows",
    title: "Bent-over Rows Guide",
    description: "Build a strong back with rows",
    duration: "3:40",
    type: "remote",
    remoteUrl: "https://www.youtube.com/watch?v=G8l_8chR5BE",
    thumbnail: "https://img.youtube.com/vi/G8l_8chR5BE/maxresdefault.jpg",
  },
  "lat-pulldowns": {
    id: "lat-pulldowns",
    title: "Lat Pulldowns Tutorial",
    description: "Target your latissimus dorsi",
    duration: "2:50",
    type: "remote",
    remoteUrl: "https://www.youtube.com/watch?v=CAwf7n6Luuc",
    thumbnail: "https://img.youtube.com/vi/CAwf7n6Luuc/maxresdefault.jpg",
  },

  // Cardio Exercises
  running: {
    id: "running",
    title: "Running Form Guide",
    description: "Improve your running technique",
    duration: "6:15",
    type: "remote",
    remoteUrl: "https://www.youtube.com/watch?v=_kGESn8ArrI",
    thumbnail: "https://img.youtube.com/vi/_kGESn8ArrI/maxresdefault.jpg",
  },
  cycling: {
    id: "cycling",
    title: "Cycling Workout",
    description: "Indoor cycling for cardio fitness",
    duration: "8:30",
    type: "remote",
    remoteUrl: "https://www.youtube.com/watch?v=8c0B5aG6Z_E",
    thumbnail: "https://img.youtube.com/vi/8c0B5aG6Z_E/maxresdefault.jpg",
  },
  "jump-rope": {
    id: "jump-rope",
    title: "Jump Rope Tutorial",
    description: "Master jump rope for cardio",
    duration: "4:45",
    type: "remote",
    remoteUrl: "https://www.youtube.com/watch?v=1BZM2Vre5oc",
    thumbnail: "https://img.youtube.com/vi/1BZM2Vre5oc/maxresdefault.jpg",
  },
};

// Helper function to get video by exercise name
export const getVideoByExerciseName = (
  exerciseName: string
): WorkoutVideo | null => {
  // Create a mapping for the specific video files we have
  const videoMapping: Record<string, string> = {
    "bench press": "bench-press",
    bench: "bench-press",
    "dumbbell fly": "dumbbell-fly",
    "dumbbell flys": "dumbbell-fly",
    "cable fly": "dumbbell-fly",
    "cable flys": "dumbbell-fly",
    "push-ups": "push-ups",
    "push ups": "push-ups",
    pushups: "push-ups",
    "plyo push-ups": "push-ups",
    squats: "squats",
    rows: "bent-over-rows",
    "lat pulldown": "lat-pulldowns",
    "shoulder press": "military-press",
    "overhead press": "military-press",
    intervals: "running",
    "tempo run": "running",
    "rowing machine": "running",
    "assault bike": "cycling",
    jogging: "running",
    "box jumps": "jump-rope",
    sprints: "running",
    "medicine ball slams": "jump-rope",
    "broad jumps": "jump-rope",
    "hip openers": "running",
    "thoracic twists": "running",
    "hamstring stretch": "running",
    "ankle mobility": "running",
    "hip flexor stretch": "running",
    deadlift: "deadlifts",
    deadlifts: "deadlifts",
    "goblet squat": "squats",
    "incline db press": "bench-press",
    "seated cable row": "bent-over-rows",
    "bodyweight circuit": "push-ups",
    "full-body routine": "push-ups",
  };

  // First check the specific mapping
  const mappedKey = videoMapping[exerciseName.toLowerCase()];
  if (mappedKey && workoutVideos[mappedKey]) {
    return workoutVideos[mappedKey];
  }

  // Fallback to the original logic
  const videoKey = exerciseName
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
  return workoutVideos[videoKey] || null;
};

// Helper function to get video URL
export const getVideoUrl = (exerciseName: string): string | null => {
  const video = getVideoByExerciseName(exerciseName);
  if (!video) return null;

  if (video.type === "local" && video.localPath) {
    return video.localPath;
  } else if (video.type === "remote" && video.remoteUrl) {
    return video.remoteUrl;
  }

  return null;
};
