'use client';

import {
	DisconnectButton,
	useLocalParticipant,
	useVoiceAssistant,
    useMultibandTrackVolume
} from "@livekit/components-react";
import { RpcError, type RpcInvocationData } from "livekit-client";
import { useCallback, useRef } from "react";
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useGSAP } from "@gsap/react";
import { PhoneOff, PhoneCall } from 'lucide-react';
import gsap from "gsap";
import { useAppContext } from "@/providers/livekit-provider";

const steps = [
    {
        step: 1,
        elementId: "username",
        description: "Field to enter your username.",
        action: "Enter your username in the highlighted field.",
    },
    {
        step: 2,
        elementId: "email",
        description: "Field to enter your email.",
        action: "Enter your email in the highlighted field.",
    },
    {
        step: 3,
        elementId: "hobby",
        description: "Field to enter your hobby.",
        action: "Enter your hobby in the highlighted field.",
    },
    {
        step: 4,
        elementId: "submit",
        description: "Button to submit the form.",
        action: "Click the highlighted button to submit the form.",
    },
];

function VoiceBox() {
    const { state, audioTrack } = useVoiceAssistant();
	const volume = useMultibandTrackVolume(audioTrack, { bands: 1 })[0] || 0;

	const containerRef = useRef<HTMLDivElement | null>(null);

	useGSAP(
		() => {
			if (!containerRef.current) return;

			const box = containerRef.current.children;

			gsap
				.timeline({ repeat: -1 })
				.to(box, {
					scale: volume * 10 > 1 ? volume * 10 : 1.2,
					duration: 0.7,
					ease: "sine.inOut",
				})
				.to(
					box,
					{
						scale: 1,
						ease: "sine.inOut",
						duration: 0.9,
					},
					"-=0.3",
				);
		},
		{ dependencies: [volume, state], scope: containerRef },
	);

	return (
		<div
			className="w-16 h-16 rounded-lg border flex items-center justify-center gap-2"
			ref={containerRef}
		>
			<div className="eye h-6 w-6 rounded-full bg-indigo-500" />
		</div>
	);
}

function WavyLoader() {
	const loadingRef = useRef<HTMLDivElement | null>(null);

	useGSAP(
		() => {
			if (!loadingRef.current) return;

			const dots = loadingRef.current.children;

			const tl = gsap.timeline({ repeat: -1 });

			tl.to(dots, {
				y: -10,
				duration: 0.2,
				stagger: 0.04,
				ease: "power1.inOut",
			}).to(dots, {
				y: 0,
				duration: 0.2,
				stagger: 0.04,
				ease: "power1.inOut",
			});
		},
		{ scope: loadingRef },
	);

	return (
		<div ref={loadingRef} className={"flex items-center justify-center gap-1"}>
			{[...Array(4)].map((_, i) => (
				<div key={i} className="w-3 h-3 rounded-full bg-primary" />
			))}
		</div>
	);
}

export function ChatterBox() {
  const { connectionDetails, setConnectionDetails, loading, setLoading } = useAppContext();

  // Local participant refers to "yourself" or whosoever using the current session.
    const localParticipant = useLocalParticipant();

  const { state } = useVoiceAssistant();

  const handleConnect = useCallback(async () => {
		setLoading(true);
		const response = await fetch(`/api`);
		const connectionDetailsData = await response.json();
		if (response.status === 200) {
			setConnectionDetails(connectionDetailsData);
		} else {
			toast("Failed to get token");
		}
		setLoading(false);
	}, []);

    localParticipant.localParticipant.registerRpcMethod(
		"execute_rfc",
		async (data: RpcInvocationData) => {
			try {
				const params = JSON.parse(data.payload);

                console.log("params from rpc", params)

				const elementId = params.elementId;

                console.log("elementId", elementId)

				if (!elementId) {
					return "Relevant element not found!"
				}

				const element = document.getElementById(elementId) as HTMLInputElement;

                const step = steps.find(step => step.step === elementId)?.action;

                console.log("element", element)

				if (!element) {
					return "Relevant element not found!"
				}

                element.classList.add(
                  "border",
                  "rounded-xl",
                  "p-4",
                  "ring-2",
                  "ring-purple-800",
                  "bg-purple-500/20",
                  "text-purple-800"
                );


				return `Please Execute ${step}`
			} catch (error) {
				// Step 8: Handle error if something went wrong.
				throw new RpcError(1500, "Couldn't able to perform RPC.");
			}
		},
	);

  return (
    <div id={"chatterbox"} className={"fixed right-10 bottom-5"}>
        <div className={"bg-background/80"}>
        {connectionDetails ? (
            // Active session UI
            <div className={"flex flex-col gap-4 items-end relative"}>
                {/* Agents speaks from here */}
                <div
                    className={
                        "flex justify-center items-center border rounded-lg h-24 gap-4 p-4"
                    }
                >
                    <VoiceBox />
                    <div
                        className={
                            "w-2/3 flex flex-col justify-center items-center gap-2"
                        }
                    >
                        <p className={"text-sm"}>
                            {state === "listening" ? "Listening" : "Talk to interrupt"}
                        </p>
                        <div className={"w-full flex gap-1 items-center"}>
                            <DisconnectButton className={"w-full"}>
                                <Button size={"sm"} variant={"outline"} className={"w-full"}>
                                    <PhoneOff className={"fill-red-500 text-red-500"} />
                                    Disconnect
                                </Button>
                            </DisconnectButton>
                        </div>
                    </div>
                </div>
            </div>
        ) : loading ? (
            <div
                className={
                    "flex items-center justify-center border rounded-lg h-24 w-64"
                }
            >
                <WavyLoader />
            </div>
        ) : (
            // Inactive session UI
            <div
                className={
                    "flex gap-3 items-center justify-center border rounded-lg h-24 w-64"
                }
            >
                <div className="h-12 w-12 rounded-full bg-indigo-500" />
                <div className="space-y-2">
                    <p className="text-sm">Need Assistance ?</p>
                    <Button
                        variant={"outline"}
                        size={"sm"}
                        onClick={handleConnect}
                        className="w-full"
                    >
                        <PhoneCall
                            className={"fill-emerald-300 text-emerald-300"}
                            size={20}
                        />
                        Ask AI
                    </Button>
                </div>
            </div>
        )}
        </div>
        <Button
            variant={"link"}
            className={"text-sm text-center text-muted-foreground w-64"}
        >
            11Labs Hackathon
        </Button>
    </div>
  );
}

