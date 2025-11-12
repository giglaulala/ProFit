import { Ionicons } from "@expo/vector-icons";
import Colors from "./Colors";

export type AchievementId =
  | "first_workout"
  | "seven_day_challenge"
  | "thirty_day_challenge";

export interface AchievementDefinition {
  id: AchievementId;
  titleKey: string;
  descriptionKey: string;
  icon: keyof typeof Ionicons.glyphMap;
  colorKey: keyof typeof Colors["light"];
  target: number;
}

export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    id: "first_workout",
    titleKey: "achievements.firstWorkout",
    descriptionKey: "achievements.firstWorkoutDescription",
    icon: "star",
    colorKey: "secondary",
    target: 1,
  },
  {
    id: "seven_day_challenge",
    titleKey: "achievements.sevenDayChallenge",
    descriptionKey: "achievements.sevenDayChallengeDescription",
    icon: "trophy",
    colorKey: "primary",
    target: 7,
  },
  {
    id: "thirty_day_challenge",
    titleKey: "achievements.thirtyDayChallenge",
    descriptionKey: "achievements.thirtyDayChallengeDescription",
    icon: "medal",
    colorKey: "darkGreen",
    target: 30,
  },
];

export const ACHIEVEMENT_IDS = ACHIEVEMENT_DEFINITIONS.map(
  (a) => a.id
) as AchievementId[];

