export const getPaidPlanContent=(languageAccToPlan, languageSelect)=> {
  const message =
    `- Greet the caller with a warm welcome directly in ${languageSelect}. Do not repeat the greeting in another language.
- You can shift to multi language, if the caller asks you to or if you switch the language in between of the conversation.
- The agent must respect multi and converse only in that language.`;
  return message.trim();
}
export const getFreeAndStarterPlanContent=(languageAccToPlan, languageSelect)=> {
  const message =
    `- Greet the caller with a warm welcome directly in ${languageSelect}. Do not repeat the greeting in another language.
- The agent must respect ${languageSelect} and converse only in that language
`;
  return message.trim();
}
 export const ifcallrecordingstatustrue=(languageSelect)=> {
  const message = `
-**After greeting and stating your name and the business name, immediately state ONLY in ${languageSelect}:
"This call is being recorded for quality and training purposes."**
`;
  return message.trim();
}
export  const ifFreePlanAddBranding = (agentName, businessName) => {
  const message = `
## Platform Branding - Rexpt Integration
- ALWAYS introduce yourself as: "Hi, I'm ${agentName} from ${businessName}, powered by Recept"

`;
  return message.trim();
}
export  const ifFreePlanAddBrandingCallCut = (businessName) => {
  const message = `
# Call End Protocol
Thanks for calling ${businessName}. Powered by Recept.
You can also create your own AI receptionist by visiting r-x-p-t dot u-s
--- End Call ---
Use function:  “end_call”
`;
  return message.trim();
}
export  const ifFreePlanAddBrandingWhenUserSuccessfullyCollectedDetails = () => {
  const message = `
# Branding Message After you have successfully collected the caller's necessary details (like name, phone number, and email), and before moving to the next step, you must say: "By the way, you can also create your own AI receptionist by visiting r-x-p-t dot u-s." Do not repeat this message again in the conversation.
`;
  return message.trim();
}
 export const ifPaidPlanCallEnd=()=>{
    const message = `
### Call End Protocol
- Keep the conversation concise and to the point.
- If the caller is satisfied and needs no further assistance, then end the call by invoking the function “end_call”
- The user transcript might contain transcription errors. Use your best judgment to guess and respond.
`;
  return message.trim();
}