import { useEffect, useState } from "react";
import { ethers } from "ethers";
import web3modal from "web3modal";
import { address, abi } from "../config.js";
import styles from "../styles/style";
import { Navbar } from "../components";

export default function Gigs() {
    const [gigs, setGigs] = useState([]);

    useEffect(() => {
        fetchAllGigs();
    }, []);

    async function fetchAllGigs() {
        try {
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const contract = new ethers.Contract(address, abi, provider);
            const data = await contract.listGigs();

            if (!data || data.length === 0) {
                console.warn("⚠️ No gigs found.");
                return;
            }

            const itemsFetched = await Promise.all(
                data.map(async (i) => {
                    let parseStringFlowRate = ethers.utils.formatEther(i.stringFlowRate);
                    let item = {
                        host: i.host.toString(),
                        title: i.title,
                        description: i.description,
                        time: i.time,
                        meetingId: i.meetingId,
                        flowRate: i.flowRate.toNumber(),
                        stringFlowRate: parseStringFlowRate,
                        gigId: i.gigId.toNumber(),
                        nftTokenId: i.nftTokenId.toNumber(),
                        attendees: i.attendees.toNumber(),
                    };
                    return item;
                })
            );

            console.log("✅ Fetched Gigs:", itemsFetched);
            setGigs(itemsFetched);
        } catch (error) {
            console.error("❌ Error fetching gigs:", error);
        }
    }

    async function buy(prop) {
        try {
            const modal = new web3modal({
                network: "mumbai",
                cacheProvider: true,
            });

            const connection = await modal.connect();
            const provider = new ethers.providers.Web3Provider(connection);
            const signer = provider.getSigner();
            const contract = new ethers.Contract(address, abi, signer);

            const advancePay = prop.stringFlowRate * 10 / 100;
            const price = ethers.utils.parseUnits(advancePay.toString(), "ether");

            console.log(`💰 Purchasing gig ${prop.gigId} for ${price} ETH...`);

            const transaction = await contract.buy(prop.gigId, {
                value: price,
                gasLimit: 1000000,
            });

            await transaction.wait();
            console.log("✅ Purchase successful!");

            fetchAllGigs();  // Refresh list after purchase
        } catch (error) {
            console.error("❌ Error purchasing gig:", error);
        }
    }

    function Card(prop) {
        const add0 = (t) => (t < 10 ? `0${t}` : String(t));
        const getDateStandard = (dt) => {
            const y = dt.getFullYear();
            const m = add0(dt.getMonth() + 1);
            const d = add0(dt.getDate());
            const w = dt.toDateString().substring(0, 3);
            const h = add0(dt.getHours());
            const min = add0(dt.getMinutes());
            return `${d}-${m}-${y} ${w} ${h}:${min}`;
        };
        const dateTime = new Date(prop.time);

        return (
            <div className={`bg-primary ${styles.flexStart}`}>
                <div className={`${styles.boxWidth}`}>
                    <section
                        className={`${styles.flexCenter} ${styles.marginY} !mb-0 ${styles.padding} sm:flex-row flex-col bg-black-gradient-3 rounded-[20px] box-shadow mx-10`}
                    >
                        <div className="flex-1 flex flex-col w-full">
                            <div className="flex items-center justify-between w-full">
                                <div className="grow-[3] max-w-[75%]">
                                    <h1 className="flex-1 font-poppins font-semibold ss:text-[40px] text-[32px] text-white ss:leading-[50.8px] leading-[45px] capitalize">
                                        {prop.title}
                                    </h1>
                                    <p className="font-thin text-slate-200 mt-1 leading-5">{prop.description}</p>
                                    <p className="mt-3 text-gray-500">Date: {getDateStandard(dateTime)}</p>
                                </div>
                                <div className="flex flex-1 justify-center items-end flex-col">
                                    <p>Price: {prop.stringFlowRate} Eth/Hour</p>
                                    <button
                                        type="button"
                                        onClick={() => buy(prop)}
                                        className={`py-4 mt-2 px-12 font-poppins font-medium text-[18px] text-primary bg-blue-gradient rounded-[10px] outline-none ${styles}`}
                                    >
                                        Buy
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        );
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
                    <h1 className="flex-1 font-poppins font-semibold ss:text-[72px] text-[52px] text-white ss:leading-[100.8px] leading-[75px]">
                        Browse all lectures <span className="text-gradient">on Teacho</span>
                    </h1>
                </div>
            </div>
            <div>
                <div className="pb-20">
                    {gigs.length > 0 ? (
                        gigs.map((item, i) => (
                            <Card
                                key={i}
                                host={item.host}
                                title={item.title}
                                description={item.description}
                                time={item.time}
                                meetingId={item.meetingId}
                                flowRate={item.flowRate}
                                stringFlowRate={item.stringFlowRate}
                                gigId={item.gigId}
                            />
                        ))
                    ) : (
                        <p className="text-center text-gray-400 mt-10">No gigs available.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
