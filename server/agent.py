import json
import logging
from typing import Annotated

from dotenv import load_dotenv
from livekit.agents import (
    AutoSubscribe,
    JobContext,
    JobProcess,
    WorkerOptions,
    cli,
    llm,
)
from livekit.agents.pipeline import VoicePipelineAgent
from livekit.plugins import deepgram, openai, silero, elevenlabs

load_dotenv()

logger = logging.getLogger("11labs-hackathon")
logger.setLevel(logging.INFO)

elevenlabsTTS = elevenlabs.tts.TTS(
    model="eleven_turbo_v2_5",
    voice=elevenlabs.tts.Voice(
        id="21m00Tcm4TlvDq8ikWAM",
        name="Rachel",
        category="premade",
        settings=elevenlabs.tts.VoiceSettings(
            stability=0.71,
            similarity_boost=0.5,
            style=0.0,
            use_speaker_boost=True,
        ),
    ),
    language="en",
    streaming_latency=3,
    enable_ssml_parsing=False,
    chunk_length_schedule=[80, 120, 200, 260],
)


class AssistantFnc(llm.FunctionContext):
    """
    The class defines a set of LLM functions that the assistant can execute.
    """

    def __init__(self, context: Annotated[JobContext, ""], pid: Annotated[str, "Participant Id"]):
        super().__init__()
        self.context: Annotated[JobContext, ""] = context
        self.pid: Annotated[str, "Participant Id"] = pid

    @llm.ai_callable()
    async def trigger_interactive_demo(
        self,
        element_id: Annotated[
            str,
            llm.TypeInfo(
                description="The Unique element Id of the form element."
            ),
        ],
    ):
        """Triggered when a user inquires about the process of filling out the profile form, trigger an step by step interactive demo."""


        try:
            response = await self.context.room.local_participant.perform_rpc(
                destination_identity=self.pid,
                method="execute_rfc",
                payload=json.dumps({"elementId": element_id}),
                response_timeout=60,
            )
            return response
        except Exception as e:
            print(e)
            return "Sorry, I am unable to initialize the relevant guide at the moment."


def prewarm_process(proc: JobProcess):
    # preload silero VAD in memory to speed up session start
    proc.userdata["vad"] = silero.VAD.load()


async def entrypoint(ctx: JobContext):
    await ctx.connect(auto_subscribe=AutoSubscribe.AUDIO_ONLY)

    participant = await ctx.wait_for_participant()

    fnc_ctx = AssistantFnc(context=ctx, pid=participant.identity)
    initial_chat_ctx = llm.ChatContext().append(
        text=(
        """
        Your name is Gibble, an interactive assistant developed by Aditya from Thundergen as part of a hackathon organized by Eleven Labs.

        ## Purpose
        Gibble's primary function is to guide users through this platform by providing information and interactive demos.

        ## Capabilities

        Gibble will inform users when performing function calls and will execute interactive guides one step at a time, waiting for user confirmation before proceeding.


        Gibble can:
        - Explain platform features
        - Guide users through interactive demos

        ### Available Demo
        #### **How to Fill the Profile Form**
        **Description:** The profile form allows users to enter their personal information.

        #### **Steps:**
        1. **Username Field**
        - **Element ID:** `username`
        - **Description:** Field to enter your username.
        - **Action:** Enter your username in the highlighted field.

        2. **Email Field**
        - **Element ID:** `email`
        - **Description:** Field to enter your email.
        - **Action:** Enter your email in the highlighted field.

        3. **Hobby Field**
        - **Element ID:** `hobby`
        - **Description:** Field to enter your hobby.
        - **Action:** Enter your hobby in the highlighted field.

        4. **Submit Button**
        - **Element ID:** `submit`
        - **Description:** Button to submit the form.
        - **Action:** Click the highlighted button to submit the form.

        #### **Trigger Condition:**
        Automatically initiate this demo when a user asks how to fill out the profile form.

        ## Restrictions
        Gibble will not respond to political or controversial topics, including religion.
        
        """
        ),
        role="system",
    )
    agent = VoicePipelineAgent(
        vad=ctx.proc.userdata["vad"],
        stt=deepgram.STT(),
        llm=openai.LLM(model="gpt-4o"),
        tts=elevenlabsTTS,
        fnc_ctx=fnc_ctx,
        chat_ctx=initial_chat_ctx,
        max_nested_fnc_calls=1,
        
    )

    # Start the assistant. This will automatically publish a microphone track and listen to the participant.
    agent.start(ctx.room, participant)
    await agent.say(
        "Hello my name is Gibble, how can I help you today ?"
    )


if __name__ == "__main__":
    cli.run_app(
        WorkerOptions(
            entrypoint_fnc=entrypoint,
            prewarm_fnc=prewarm_process,
        ),
    )