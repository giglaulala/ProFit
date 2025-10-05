import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import Constants from "expo-constants";

const extra = (Constants?.expoConfig?.extra ||
  (Constants as any)?.manifest?.extra) as any;
const supabaseUrl: string = extra?.supabaseUrl;
const supabaseAnonKey: string = extra?.supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "Supabase credentials are missing. Set expo.extra.supabaseUrl and supabaseAnonKey"
  );
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "", {
  auth: {
    storage: AsyncStorage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
