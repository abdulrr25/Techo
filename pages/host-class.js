import { useState } from "react";
import { ethers } from "ethers";
import web3modal from "web3modal";
import { address, abi } from "../config.js";
import styles from "../styles/style";
import { Navbar } from "../components";
import { Input, Stack } from "@chakra-ui/react";
import {
    FormControl,
    FormLabel,
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
} from "@chakra-ui/react";

export default function Publish() {
    const [formInput, setFormInput] = useState({
        title: "",
        description: "",
        startTime: "",
        stringFlowRate: "",
    });

    async function createMeeting() {
        try {
            console.log("🔹 Requesting new room...");
            const response = await fetch(`/api/create-room`, { method: "POST" });
            const resJson = await response.json();

            if (!resJson.roomId) {
                console.error("❌ Failed to generate a new room:", resJson);
                return null;
            }

            console.log("✅ New room created:", resJson.roomId);
            return resJson.roomId;
        } catch (error) {
            console.error("❌ Error creating meeting:", error);
            return null;
        }
    }

    async function publish() {
        if (!formInput.title || !formInput.description || !formInput.startTime || !formInput.stringFlowRate) {
            console.error("⚠️ Missing required fields.");
            return;
        }

        const meetingId = await createMeeting(); // ✅ Always get a new room ID

        if (!meetingId) {
            console.error("❌ Error: Could not generate a room. Cannot publish class.");
            return;
        }

        console.log("🔹 Using new room ID:", meetingId);

        const modal = new web3modal({ network: "mumbai", cacheProvider: true });

        try {
            const connection = await modal.connect();
            const provider = new ethers.providers.Web3Provider(connection);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(address, abi, signer);

            const parseStringFlowRate = ethers.utils.parseEther(formInput.stringFlowRate);

            console.log(`📅 Publishing Class: ${formInput.title} (Meeting ID: ${meetingId})`);

            const publishTx = await contract.createGig(
                formInput.title,
                formInput.description,
                formInput.startTime,
                meetingId,
                385802469135802, // Fixed flow rate
                parseStringFlowRate,
                { gasLimit: 1000000 }
            );

            await publishTx.wait();
            console.log("✅ Class Successfully Published!");
        } catch (error) {
            console.error("❌ Error publishing class:", error);
        }
    }

    return (
        <div className="bg-primary w-full overflow-hidden min-h-screen">
            <div className={`${styles.paddingX} ${styles.flexCenter}`}>
                <div className={`${styles.boxWidth}`}>
                    <Navbar />
                </div>
            </div>
            <div className={`bg-primary ${styles.flexStart} mt-5 text-center`}>
                <div className={`${styles.boxWidth}`}>
                    <h1 className="font-poppins font-semibold text-[52px] text-white leading-[75px]">
                        Host your <span className="text-gradient">First Lecture</span>
                    </h1>
                </div>
            </div>
            <div className={`bg-primary ${styles.flexStart}`}>
                <div className={`${styles.boxWidth}`}>
                    <section className={`${styles.flexCenter} ${styles.marginY} ${styles.padding} sm:flex-row flex-col bg-black-gradient-2 rounded-[20px] box-shadow mx-20`}>
                        <div className="flex-1 flex flex-col">
                            <h2 className={styles.heading2}>Fill the given details.</h2>
                            <Stack gap={2}>
                                <FormControl>
                                    <FormLabel fontSize={20}>Title</FormLabel>
                                    <Input
                                        type="text"
                                        w="100%"
                                        borderRadius={8}
                                        py={2}
                                        px={2}
                                        color={"black"}
                                        placeholder="Title"
                                        required
                                        value={formInput.title}
                                        onChange={(e) => setFormInput({ ...formInput, title: e.target.value })}
                                    />
                                </FormControl>
                                <FormControl>
                                    <FormLabel>Description</FormLabel>
                                    <Input
                                        type="text"
                                        w="100%"
                                        borderRadius={8}
                                        py={2}
                                        px={2}
                                        color={"black"}
                                        placeholder="Description"
                                        required
                                        value={formInput.description}
                                        onChange={(e) => setFormInput({ ...formInput, description: e.target.value })}
                                    />
                                </FormControl>
                                <div className="flex gap-5">
                                    <FormControl className="flex-1">
                                        <FormLabel>Meeting Time</FormLabel>
                                        <Input
                                            type="datetime-local"
                                            w="100%"
                                            borderRadius={8}
                                            py={2}
                                            px={2}
                                            color={"black"}
                                            placeholder="Meeting Time"
                                            required
                                            value={formInput.startTime}
                                            onChange={(e) => setFormInput({ ...formInput, startTime: e.target.value })}
                                        />
                                    </FormControl>
                                    <FormControl className="flex-1">
                                        <FormLabel>Flow Rate (Eth/Hour)</FormLabel>
                                        <NumberInput
                                            value={formInput.stringFlowRate}
                                            onChange={(rate) => setFormInput({ ...formInput, stringFlowRate: rate })}
                                        >
                                            <NumberInputField
                                                w="100%"
                                                borderRadius={8}
                                                py={2}
                                                px={2}
                                                color={"black"}
                                                placeholder="eth/hour"
                                                required
                                            />
                                            <NumberInputStepper>
                                                <NumberIncrementStepper />
                                                <NumberDecrementStepper />
                                            </NumberInputStepper>
                                        </NumberInput>
                                    </FormControl>
                                </div>
                            </Stack>
                            <div className="mt-8">
                                <button
                                    type="button"
                                    onClick={publish}
                                    className={`py-4 px-6 font-poppins font-medium text-[18px] text-primary bg-blue-gradient rounded-[10px] outline-none ${styles}`}
                                >
                                    Host Class
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
