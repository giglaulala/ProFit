export const dynamic = "force-dynamic";

type ChatRequestBody = {
  input?: string;
  messages?: { role: "system" | "user" | "assistant"; content: string }[];
};

// Simple fitness-focused response generator
function generateFitnessResponse(userInput: string): string {
  const input = userInput.toLowerCase();

  if (input.includes("workout") || input.includes("exercise")) {
    return "Great question! For effective workouts, I recommend:\n\n• Start with 3-4 sessions per week\n• Include both cardio and strength training\n• Focus on compound movements like squats, deadlifts, and push-ups\n• Gradually increase intensity and duration\n• Always warm up properly and listen to your body\n\nWhat specific type of workout are you interested in?";
  }

  if (
    input.includes("diet") ||
    input.includes("nutrition") ||
    input.includes("food")
  ) {
    return "Nutrition is key to fitness success! Here are some tips:\n\n• Eat a balanced diet with lean proteins, complex carbs, and healthy fats\n• Stay hydrated - aim for 8-10 glasses of water daily\n• Eat smaller, more frequent meals throughout the day\n• Include plenty of fruits and vegetables\n• Consider timing meals around your workouts\n\nWould you like specific meal plan suggestions?";
  }

  if (
    input.includes("weight") ||
    input.includes("fat") ||
    input.includes("lose")
  ) {
    return "Sustainable weight loss requires a combination of:\n\n• Regular exercise (both cardio and strength training)\n• Calorie deficit through balanced nutrition\n• Adequate sleep and stress management\n• Consistency over time\n• Setting realistic, achievable goals\n\nRemember, slow and steady progress is more sustainable than rapid changes!";
  }

  if (
    input.includes("muscle") ||
    input.includes("strength") ||
    input.includes("build")
  ) {
    return "Building muscle and strength involves:\n\n• Progressive overload in your training\n• Compound movements (squats, deadlifts, bench press)\n• Adequate protein intake (1.6-2.2g per kg body weight)\n• Sufficient rest and recovery between sessions\n• Consistency in your training program\n\nAre you following a specific strength training program?";
  }

  if (
    input.includes("cardio") ||
    input.includes("running") ||
    input.includes("endurance")
  ) {
    return "Cardio training is excellent for heart health and endurance:\n\n• Start with moderate intensity for 20-30 minutes\n• Gradually increase duration and intensity\n• Mix different types: running, cycling, swimming, rowing\n• Include both steady-state and interval training\n• Listen to your body and don't overdo it\n\nWhat's your current fitness level?";
  }

  if (
    input.includes("motivation") ||
    input.includes("stuck") ||
    input.includes("help")
  ) {
    return "Staying motivated can be challenging! Here are some strategies:\n\n• Set specific, measurable goals\n• Track your progress and celebrate small wins\n• Find a workout buddy or join a community\n• Mix up your routine to avoid boredom\n• Remember why you started and focus on how good you feel after workouts\n\nWhat's your main fitness goal right now?";
  }

  // Default response for general fitness questions
  return "I'm here to help with your fitness journey! I can provide guidance on:\n\n• Workout routines and exercise techniques\n• Nutrition and diet advice\n• Weight loss and muscle building strategies\n• Cardio and endurance training\n• Motivation and goal setting\n\nWhat specific area would you like to focus on? Feel free to ask me anything about fitness!";
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ChatRequestBody;
    const { input, messages } = body || {};

    // Get the last user message
    const lastUserMessage =
      messages?.findLast((m) => m.role === "user")?.content || input || "";

    if (!lastUserMessage) {
      return new Response(JSON.stringify({ error: "No input provided" }), {
        status: 400,
        headers: { "content-type": "application/json" },
      });
    }

    const content = generateFitnessResponse(lastUserMessage);

    return new Response(JSON.stringify({ content }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        error: "Server error",
        details: String(error?.message || error),
      }),
      { status: 500, headers: { "content-type": "application/json" } }
    );
  }
}
