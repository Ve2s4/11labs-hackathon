"use client";

import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";
import {
	type Dispatch,
	type ReactNode,
	type SetStateAction,
	createContext,
	useContext,
	useState,
} from "react";


import { toast } from "sonner"

import type { ConnectionDetails } from "@/types";

const AppContext = createContext<
	| {
			connectionDetails: ConnectionDetails | undefined;
			setConnectionDetails: Dispatch<SetStateAction<ConnectionDetails | undefined>>;
            loading: boolean;
            setLoading: Dispatch<SetStateAction<boolean>>;
	  }
	| undefined
>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {

	// State to manage current connection details from the LiveKit server.
	const [connectionDetails, setConnectionDetails] = useState<ConnectionDetails | undefined>(undefined);

	const [loading, setLoading] = useState<boolean>(false);

	return (
		<AppContext.Provider
			value={{
				connectionDetails,
				setConnectionDetails,
				loading,
				setLoading,
			}}
		>
			<LiveKitRoom
				token={connectionDetails?.participantToken}
				serverUrl={connectionDetails?.serverUrl}
				connect={connectionDetails !== undefined}
				audio={true}
				video={false}
				onMediaDeviceFailure={() =>
					toast("Permission Needed!")
				}
				onDisconnected={() => {
					setConnectionDetails(undefined);
				}}
				className={"flex justify-center items-center"}
			>
				{children}
				<RoomAudioRenderer />
			</LiveKitRoom>
		</AppContext.Provider>
	);
}

export function useAppContext() {
	const context = useContext(AppContext);
	if (!context) {
		throw new Error("useAppContext must be used within an AppProvider");
	}
	return context;
}