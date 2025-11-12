// Language context and translations
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export type Language = "en" | "ka";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

// English translations
const enTranslations: Record<string, string> = {
  // Achievements
  "achievements.title": "Achievements",
  "achievements.firstWorkout": "First Workout",
  "achievements.firstWorkoutDescription": "Complete your first workout.",
  "achievements.sevenDayChallenge": "7 Day Challenge",
  "achievements.sevenDayChallengeDescription": "Complete workouts seven days in a row.",
  "achievements.thirtyDayChallenge": "30 Day Challenge",
  "achievements.thirtyDayChallengeDescription": "Complete workouts thirty days in a row.",
  "achievements.unlocked": "Unlocked",
  "achievements.daysLabel": "days",
  "achievements.workoutsLabel": "workouts",
  "achievements.keepGoing": "Keep going!",
  // Dashboard
  "dashboard.title": "ProFit Dashboard",
  "dashboard.subtitle": "Your fitness journey starts here",
  "dashboard.monthlyGoals": "Monthly Goals",
  "dashboard.thisWeek": "This Week",
  "dashboard.workouts": "Workouts",
  "dashboard.calories": "Calories",
  "dashboard.minutes": "Minutes",
  "dashboard.personalizedPlan": "Personalized Plan",
  "dashboard.weightLoss": "Weight Loss",
  "dashboard.muscleGain": "Muscle Gain",
  "dashboard.maintenance": "Maintain Form",
  "dashboard.strength": "Increase Strength",
  "dashboard.today": "Today",
  "dashboard.completed": "Completed",
  "dashboard.markCompleted": "Mark Completed",
  "dashboard.unmark": "Unmark",
  "dashboard.viewSummary": "View Summary",
  "dashboard.workoutFinished": "Workout Finished",
  "dashboard.time": "Time",
  "dashboard.completedExercises": "Completed",
  "dashboard.startWorkout": "Start Workout",
  "dashboard.finishWorkout": "Finish Workout",
  "dashboard.exercises": "Exercises",
  "dashboard.rest": "Rest",
  "dashboard.sets": "Sets",
  "dashboard.reps": "Reps",
  "dashboard.weight": "Weight",
  "dashboard.duration": "Duration",
  "dashboard.caloriesBurned": "Calories Burned",
  "dashboard.totalTime": "Total Time",
  "dashboard.exercisesCompleted": "Exercises Completed",
  "dashboard.workoutSummary": "Workout Summary",
  "dashboard.greatJob": "Great Job!",
  "dashboard.workoutCompleted": "Workout Completed",
  "dashboard.keepItUp": "Keep it up!",
  "dashboard.nextWorkout": "Next Workout",
  "dashboard.share": "Share",
  "dashboard.clear": "Clear",
  "dashboard.shareCode": "Share Code",
  "dashboard.calendarCode": "Calendar Code",
  "dashboard.workoutCode": "Workout Code",
  "dashboard.copyCode": "Copy Code",
  "dashboard.copied": "Copied!",
  "dashboard.invalidCode": "Invalid Code",
  "dashboard.enterValidCode": "Enter a valid ProFit code or workout id.",
  "dashboard.detected": "Detected",
  "dashboard.workoutVideo": "Workout Video",
  "dashboard.openVideo": "Open Video",
  "dashboard.close": "Close",
  "dashboard.cancel": "Cancel",
  "dashboard.ok": "OK",
  "dashboard.yes": "Yes",
  "dashboard.no": "No",
  "dashboard.loading": "Loading...",
  "dashboard.error": "Error",
  "dashboard.success": "Success",
  "dashboard.save": "Save",
  "dashboard.cardioSession": "Cardio Session",
  "dashboard.weightTraining": "Weight Training",
  "dashboard.mobilityFlow": "Mobility Flow",
  "dashboard.explosiveTraining": "Explosive Training",
  "dashboard.join": "Join",
  "dashboard.generateCalendar": "Generate Calendar",
  "dashboard.share": "Share",
  "dashboard.clear": "Clear",
  "dashboard.weightLoss": "Weight Loss",
  "dashboard.muscleGain": "Muscle Gain",
  "dashboard.maintain": "Maintain",
  "dashboard.strength": "Strength",
  "dashboard.sets": "Sets",
  "dashboard.reps": "Reps",
  "dashboard.rest": "Rest",
  "dashboard.volumeUpYourBodyGoals": "VOLUME UP YOUR\nBODY GOALS",
  "dashboard.weight": "Weight",
  "dashboard.height": "Height",
  "dashboard.freeDays": "Free Days",
  "dashboard.editWeight": "Edit Weight",
  "dashboard.editHeight": "Edit Height",
  "dashboard.editFreeDays": "Edit Free Days",
  "dashboard.weightKg": "Weight (kg)",
  "dashboard.heightCm": "Height (cm)",
  "dashboard.freeDaysPerWeek": "Free Days per Week",
  "dashboard.findCalendar": "Find Calendar",
  "dashboard.createCalendar": "Create Calendar",
  "dashboard.editCalendar": "Edit Calendar",
  "dashboard.updateCalendar": "Update Calendar",
  "dashboard.goal": "Goal",
  "dashboard.level": "Level",
  "dashboard.days": "Days",
  "dashboard.amateur": "Amateur",
  "dashboard.beginner": "Beginner",
  "dashboard.medium": "Medium",
  "dashboard.experienced": "Experienced",
  "dashboard.professional": "Professional",
  "dashboard.pickAtLeastOneDay": "Pick at least one day",

  // Calendar
  "calendar.title": "Calendar",
  "calendar.today": "Today",
  "calendar.completed": "Completed",
  "calendar.markCompleted": "Mark Completed",
  "calendar.unmark": "Unmark",
  "calendar.viewSummary": "View Summary",
  "calendar.workoutFinished": "Workout Finished",
  "calendar.time": "Time",
  "calendar.completedExercises": "Completed",
  "calendar.january": "January",
  "calendar.february": "February",
  "calendar.march": "March",
  "calendar.april": "April",
  "calendar.may": "May",
  "calendar.june": "June",
  "calendar.july": "July",
  "calendar.august": "August",
  "calendar.september": "September",
  "calendar.october": "October",
  "calendar.november": "November",
  "calendar.december": "December",
  "calendar.sunday": "Sun",
  "calendar.monday": "Mon",
  "calendar.tuesday": "Tue",
  "calendar.wednesday": "Wed",
  "calendar.thursday": "Thu",
  "calendar.friday": "Fri",
  "calendar.saturday": "Sat",
  "calendar.workoutTypes": "Workout Types:",
  "calendar.cardio": "Cardio",
  "calendar.weightTraining": "Weight Training",
  "calendar.mobility": "Mobility",
  "calendar.explosive": "Explosive",

  // Profile
  "profile.title": "Profile",
  "profile.subscription": "Subscription",
  "profile.totalWorkouts": "Total Workouts",
  "profile.workoutHours": "Workout Hours",
  "profile.account": "Account",
  "profile.editProfile": "Edit Profile",
  "profile.settings": "Settings",
  "profile.notifications": "Notifications",
  "profile.language": "Language",
  "profile.logOut": "Log Out",
  "profile.logoutConfirm": "Are you sure you want to logout?",
  "profile.cancel": "Cancel",
  "profile.logout": "Logout",

  // Tracking/Scan
  "tracking.title": "ProFit Tracking",
  "tracking.subtitle": "Monitor your fitness journey",
  "tracking.quickActions": "Quick Actions",
  "tracking.scanWorkoutQR": "Scan Workout QR",
  "tracking.recordWeight": "Record Weight",
  "tracking.bodyMeasurements": "Body Measurements",
  "tracking.enterCode": "Enter Workout/Calendar Code",
  "tracking.enterCodePlaceholder": "ProFit-XXX or workout-id",
  "tracking.recentActivities": "Recent Activities",
  "tracking.weight": "Weight",
  "tracking.current": "Current",
  "tracking.workout": "Workout",
  "tracking.noActivities": "No Activities",
  "tracking.completeWorkouts": "Complete workouts to see activity history",
  "tracking.detected": "Detected",
  "tracking.invalidQRCode":
    "Invalid QR code. Please scan a valid ProFit QR code.",
  "tracking.requestingPermission": "Requesting camera permission...",
  "tracking.cameraPermissionDenied":
    "Camera permission denied. Please enable camera access in settings.",
  "tracking.scanInstruction": "Point your camera at a QR code to scan",

  // Workouts
  "workouts.title": "ProFit Workouts",
  "workouts.subtitle": "Choose your next challenge",
  "workouts.inGym": "In Gym",
  "workouts.withoutGym": "Without Gym",
  "workouts.body": "Body",
  "workouts.category": "Category",
  "workouts.bodySelection": "Body Selection",
  "workouts.categories": "Categories",
  "workouts.videos": "Videos",
  "workouts.noVideos": "No videos for this selection.",
  "workouts.popularWorkouts": "Popular Workouts",
  "workouts.tapToExpand": "Tap to expand",
  "workouts.tapToCollapse": "Tap to collapse",
  "workouts.video": "Video",
  "workouts.quickStart": "Quick Start",
  "workouts.startRandomWorkout": "Start Random Workout",
  "workouts.randomWorkoutSubtitle": "Let us choose the perfect workout for you",
  "workouts.searchPlaceholder": "SEARCH WORKOUTS...",

  // Common
  "common.loading": "Loading...",
  "common.error": "Error",
  "common.success": "Success",
  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.close": "Close",
  "common.ok": "OK",
  "common.yes": "Yes",
  "common.no": "No",
};

// Georgian translations
const kaTranslations: Record<string, string> = {
  // Achievements
  "achievements.title": "მიღწევები",
  "achievements.firstWorkout": "პირველი ვარჯიში",
  "achievements.firstWorkoutDescription": "დაასრულე შენი პირველი ვარჯიში.",
  "achievements.sevenDayChallenge": "7 დღიანი გამოწვევა",
  "achievements.sevenDayChallengeDescription": "დაასრულე ვარჯიშები შვიდი დღის განმავლობაში ზედიზედ.",
  "achievements.thirtyDayChallenge": "30 დღიანი გამოწვევა",
  "achievements.thirtyDayChallengeDescription": "დაასრულე ვარჯიშები ოცდაათი დღის განმავლობაში ზედიზედ.",
  "achievements.unlocked": "გახსნილია",
  "achievements.daysLabel": "დღე",
  "achievements.workoutsLabel": "ვარჯიშები",
  "achievements.keepGoing": "გააგრძელე!",
  // Dashboard
  "dashboard.title": "ProFit დაფა",
  "dashboard.subtitle": "თქვენი ფიტნესის მოგზაურობა აქ იწყება",
  "dashboard.monthlyGoals": "თვიური მიზნები",
  "dashboard.thisWeek": "ეს კვირა",
  "dashboard.workouts": "ვარჯიშები",
  "dashboard.calories": "კალორიები",
  "dashboard.minutes": "წუთები",
  "dashboard.personalizedPlan": "პერსონალური გეგმა",
  "dashboard.weightLoss": "წონის დაკლება",
  "dashboard.muscleGain": "კუნთების მომატება",
  "dashboard.maintenance": "ფორმის შენარჩუნება",
  "dashboard.strength": "ძალის გაზრდა",
  "dashboard.today": "დღეს",
  "dashboard.completed": "დასრულებული",
  "dashboard.markCompleted": "მონიშნე დასრულებულად",
  "dashboard.unmark": "მოხსენი მონიშვნა",
  "dashboard.viewSummary": "იხილე შეჯამება",
  "dashboard.workoutFinished": "ვარჯიში დასრულდა",
  "dashboard.time": "დრო",
  "dashboard.completedExercises": "დასრულებული",
  "dashboard.startWorkout": "ვარჯიშის დაწყება",
  "dashboard.finishWorkout": "ვარჯიშის დასრულება",
  "dashboard.exercises": "ვარჯიშები",
  "dashboard.rest": "დასვენება",
  "dashboard.sets": "სეტები",
  "dashboard.reps": "გამეორებები",
  "dashboard.weight": "წონა",
  "dashboard.duration": "ხანგრძლივობა",
  "dashboard.caloriesBurned": "დაწვა კალორიები",
  "dashboard.totalTime": "სულ დრო",
  "dashboard.exercisesCompleted": "დასრულებული ვარჯიშები",
  "dashboard.workoutSummary": "ვარჯიშის შეჯამება",
  "dashboard.greatJob": "შესანიშნავია!",
  "dashboard.workoutCompleted": "ვარჯიში დასრულდა",
  "dashboard.keepItUp": "გააგრძელე!",
  "dashboard.nextWorkout": "შემდეგი ვარჯიში",
  "dashboard.share": "გაზიარება",
  "dashboard.clear": "გასუფთავება",
  "dashboard.shareCode": "გაზიარების კოდი",
  "dashboard.calendarCode": "კალენდრის კოდი",
  "dashboard.workoutCode": "ვარჯიშის კოდი",
  "dashboard.copyCode": "დააკოპირე კოდი",
  "dashboard.copied": "დაკოპირდა!",
  "dashboard.invalidCode": "არასწორი კოდი",
  "dashboard.enterValidCode": "შეიყვანეთ სწორი ProFit კოდი ან ვარჯიშის იდ.",
  "dashboard.detected": "აღმოჩენილი",
  "dashboard.workoutVideo": "ვარჯიშის ვიდეო",
  "dashboard.openVideo": "ვიდეოს გახსნა",
  "dashboard.close": "დახურვა",
  "dashboard.cancel": "გაუქმება",
  "dashboard.ok": "კარგი",
  "dashboard.yes": "კი",
  "dashboard.no": "არა",
  "dashboard.loading": "იტვირთება...",
  "dashboard.error": "შეცდომა",
  "dashboard.success": "წარმატება",
  "dashboard.save": "შენახვა",
  "dashboard.cardioSession": "კარდიო სესია",
  "dashboard.weightTraining": "წონის ვარჯიში",
  "dashboard.mobilityFlow": "მობილურობის ვარჯიში",
  "dashboard.explosiveTraining": "ექსპლოზიური ვარჯიში",
  "dashboard.join": "შემოუერთება",
  "dashboard.generateCalendar": "კალენდრის გენერირება",
  "dashboard.share": "გაზიარება",
  "dashboard.clear": "გასუფთავება",
  "dashboard.weightLoss": "წონის დაკლება",
  "dashboard.muscleGain": "კუნთების მომატება",
  "dashboard.maintain": "შენარჩუნება",
  "dashboard.strength": "ძალა",
  "dashboard.sets": "სეტები",
  "dashboard.reps": "გამეორებები",
  "dashboard.rest": "დასვენება",
  "dashboard.volumeUpYourBodyGoals": "გაზარდე შენი\nსხეულის მიზნები",
  "dashboard.weight": "წონა",
  "dashboard.height": "სიმაღლე",
  "dashboard.freeDays": "უფასო დღეები",
  "dashboard.editWeight": "წონის რედაქტირება",
  "dashboard.editHeight": "სიმაღლის რედაქტირება",
  "dashboard.editFreeDays": "უფასო დღეების რედაქტირება",
  "dashboard.weightKg": "წონა (კგ)",
  "dashboard.heightCm": "სიმაღლე (სმ)",
  "dashboard.freeDaysPerWeek": "უფასო დღეები კვირაში",
  "dashboard.findCalendar": "კალენდრის პოვნა",
  "dashboard.createCalendar": "კალენდრის შექმნა",
  "dashboard.editCalendar": "კალენდრის რედაქტირება",
  "dashboard.updateCalendar": "კალენდრის განახლება",
  "dashboard.goal": "მიზანი",
  "dashboard.level": "დონე",
  "dashboard.days": "დღეები",
  "dashboard.amateur": "ამატორი",
  "dashboard.beginner": "დამწყები",
  "dashboard.medium": "საშუალო",
  "dashboard.experienced": "გამოცდილი",
  "dashboard.professional": "პროფესიონალი",
  "dashboard.pickAtLeastOneDay": "აირჩიეთ მინიმუმ ერთი დღე",

  // Calendar
  "calendar.title": "კალენდარი",
  "calendar.today": "დღეს",
  "calendar.completed": "დასრულებული",
  "calendar.markCompleted": "მონიშნე დასრულებულად",
  "calendar.unmark": "მოხსენი მონიშვნა",
  "calendar.viewSummary": "იხილე შეჯამება",
  "calendar.workoutFinished": "ვარჯიში დასრულდა",
  "calendar.time": "დრო",
  "calendar.completedExercises": "დასრულებული",
  "calendar.january": "იანვარი",
  "calendar.february": "თებერვალი",
  "calendar.march": "მარტი",
  "calendar.april": "აპრილი",
  "calendar.may": "მაისი",
  "calendar.june": "ივნისი",
  "calendar.july": "ივლისი",
  "calendar.august": "აგვისტო",
  "calendar.september": "სექტემბერი",
  "calendar.october": "ოქტომბერი",
  "calendar.november": "ნოემბერი",
  "calendar.december": "დეკემბერი",
  "calendar.sunday": "კვ",
  "calendar.monday": "ორ",
  "calendar.tuesday": "სამ",
  "calendar.wednesday": "ოთხ",
  "calendar.thursday": "ხუთ",
  "calendar.friday": "პარ",
  "calendar.saturday": "შაბ",
  "calendar.workoutTypes": "ვარჯიშის ტიპები:",
  "calendar.cardio": "კარდიო",
  "calendar.weightTraining": "წონის ვარჯიში",
  "calendar.mobility": "მობილურობა",
  "calendar.explosive": "ექსპლოზიური",

  // Profile
  "profile.title": "პროფილი",
  "profile.subscription": "გამოწერა",
  "profile.totalWorkouts": "სულ ვარჯიშები",
  "profile.workoutHours": "ვარჯიშის საათები",
  "profile.account": "ანგარიში",
  "profile.editProfile": "პროფილის რედაქტირება",
  "profile.settings": "პარამეტრები",
  "profile.notifications": "შეტყობინებები",
  "profile.language": "ენა",
  "profile.logOut": "გასვლა",
  "profile.logoutConfirm": "დარწმუნებული ხართ რომ გსურთ გასვლა?",
  "profile.cancel": "გაუქმება",
  "profile.logout": "გასვლა",

  // Tracking/Scan
  "tracking.title": "ProFit მონიტორინგი",
  "tracking.subtitle": "თვალყურს ადევნეთ თქვენს ფიტნესის მოგზაურობას",
  "tracking.quickActions": "სწრაფი მოქმედებები",
  "tracking.scanWorkoutQR": "QR კოდის სკანირება",
  "tracking.recordWeight": "წონის ჩაწერა",
  "tracking.bodyMeasurements": "სხეულის ზომები",
  "tracking.enterCode": "შეიყვანეთ ვარჯიშის/კალენდრის კოდი",
  "tracking.enterCodePlaceholder": "ProFit-XXX ან ვარჯიშის-იდ",
  "tracking.recentActivities": "ბოლო აქტივობები",
  "tracking.weight": "წონა",
  "tracking.current": "მიმდინარე",
  "tracking.workout": "ვარჯიში",
  "tracking.noActivities": "აქტივობები არ არის",
  "tracking.completeWorkouts":
    "დაასრულეთ ვარჯიშები აქტივობების ისტორიის სანახავად",
  "tracking.detected": "აღმოჩენილი",
  "tracking.invalidQRCode":
    "არასწორი QR კოდი. გთხოვთ, სკანირება სწორი ProFit QR კოდი.",
  "tracking.requestingPermission": "კამერის ნებართვის მოთხოვნა...",
  "tracking.cameraPermissionDenied":
    "კამერის ნებართვა უარყოფილია. გთხოვთ, ჩართოთ კამერის წვდომა პარამეტრებში.",
  "tracking.scanInstruction": "მიმართეთ კამერა QR კოდზე სკანირებისთვის",

  // Workouts
  "workouts.title": "ProFit ვარჯიშები",
  "workouts.subtitle": "აირჩიეთ თქვენი შემდეგი გამოწვევა",
  "workouts.inGym": "სპორტდარბაზში",
  "workouts.withoutGym": "სპორტდარბაზის გარეშე",
  "workouts.body": "სხეული",
  "workouts.category": "კატეგორია",
  "workouts.bodySelection": "სხეულის არჩევა",
  "workouts.categories": "კატეგორიები",
  "workouts.videos": "ვიდეოები",
  "workouts.noVideos": "ამ არჩევანისთვის ვიდეოები არ არის.",
  "workouts.popularWorkouts": "პოპულარული ვარჯიშები",
  "workouts.tapToExpand": "დააჭირეთ გასაფართოებლად",
  "workouts.tapToCollapse": "დააჭირეთ დასაკეცად",
  "workouts.video": "ვიდეო",
  "workouts.quickStart": "სწრაფი დაწყება",
  "workouts.startRandomWorkout": "შემთხვევითი ვარჯიშის დაწყება",
  "workouts.randomWorkoutSubtitle":
    "მოდით ჩვენ ავირჩიოთ თქვენთვის სრულყოფილი ვარჯიში",
  "workouts.searchPlaceholder": "ვარჯიშების ძებნა...",

  // Common
  "common.loading": "იტვირთება...",
  "common.error": "შეცდომა",
  "common.success": "წარმატება",
  "common.save": "შენახვა",
  "common.cancel": "გაუქმება",
  "common.close": "დახურვა",
  "common.ok": "კარგი",
  "common.yes": "კი",
  "common.no": "არა",
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const saved = await AsyncStorage.getItem("appLanguage");
      if (saved === "en" || saved === "ka") {
        setLanguageState(saved);
      }
    } catch (error) {
      console.error("Error loading language:", error);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      setLanguageState(lang);
      await AsyncStorage.setItem("appLanguage", lang);
    } catch (error) {
      console.error("Error saving language:", error);
    }
  };

  const t = (key: string): string => {
    const translations = language === "ka" ? kaTranslations : enTranslations;
    return translations[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
