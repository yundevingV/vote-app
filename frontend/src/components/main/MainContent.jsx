"use client";

import Web3 from "web3";
import React, { useEffect, useState } from "react";
import cx from "classnames";
import contractABI from "../../abi/contractABI.json";
import { useRouter } from "next/navigation";
import VoteButton from "../Button/VoteButton";
const MainContent = () => {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);

  const router = useRouter();

  // 스마트 콘트랙트 주소
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

  useEffect(() => {
    const loadWeb3AndContract = async () => {
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: "eth_requestAccounts" });
        const accounts = await web3.eth.getAccounts();
        setAccount(accounts[0]);

        const contractInstance = new web3.eth.Contract(
          contractABI,
          contractAddress
        );
        setContract(contractInstance);

        try {
          await loadGetAllPoll(contractInstance);
          await loadGetPollCount(contractInstance);
        } catch (error) {
          alert(
            "계약 호출에 오류가 발생했습니다. ABI와 계약 주소를 확인해 주세요."
          );
        }
      } else {
        alert("메타마스크를 설치해 주세요!");
        router.push("/onboarding");
      }
    };

    loadWeb3AndContract();
  }, []);

  // createPoll
  const [question, setQuestion] = useState("");

  const handleCreatePoll = async () => {
    if (!contract && !question) return;
    await contract.methods.createPoll(question).send({ from: account });

    setQuestion("");
    await loadGetAllPoll(contract);
  };

  // getPollCount
  const [pollCount, setPollCount] = useState();

  const loadGetPollCount = async (contractInstance) => {
    const newPollCount = await contractInstance.methods.getPollCount().call();
    setPollCount(newPollCount);
  };

  // getAllPoll
  const [polls, setPolls] = useState([]);

  const loadGetAllPoll = async (contractInstance) => {
    const result = await contractInstance.methods.getAllPoll().call();

    const questions = result[0];
    const owners = result[1];
    const isActive = result[2];
    const candidates = result[3];
    const voterAddresses = result[4];

    const newPolls = questions.map((question, index) => ({
      question,
      owner: owners[index],
      isActive: isActive[index],
      candidates: candidates[index],
      voterAddresses: voterAddresses[index],
    }));
    setPolls(newPolls);
  };

  const handleInputChange = (event) => {
    const value = event.target.value;
    setQuestion(value);
  };

  const handleNavigate = (pollId) => {
    router.push(`/vote?id=${pollId}`);
  };

  // 투표 토글
  const [viewMode, setViewMode] = useState("all");

  const activePolls = polls.filter((poll) => poll.isActive);
  const inactivePolls = polls.filter((poll) => !poll.isActive);

  return (
    <div className="flex flex-col gap-10 ">
      <div className="flex justify-between items-center">
        <h2 className="text-4xl font-bold ">⛓️ 투표</h2>
        <div className="flex justify-center gap-2">
          <input
            type="text"
            value={question}
            onChange={handleInputChange}
            placeholder="질문을 입력하세요"
            className="p-4 w-80 h-10 bg-slate-50 rounded-lg text-black"
          />
          <VoteButton
            text={"투표 만들기"}
            itemId={question}
            bGColor={"bg-emerald-500"}
            hoverBgColor={"hover:bg-emerald-600"}
            isActive={question.length > 0}
            isDisabled={!question.length}
            onClick={handleCreatePoll}
          />
        </div>
      </div>
      <div className="flex gap-5 justify-center">
        <button
          onClick={() => setViewMode("all")}
          className={cx(
            "text-lg font-semibold duration-500 hover:scale-105 p-2 rounded-lg",
            {
              "bg-emerald-500": viewMode === "all",
            }
          )}
        >
          모든 투표 ({polls.length})
        </button>
        <button
          onClick={() => setViewMode("active")}
          className={cx(
            "text-lg font-semibold duration-500 hover:scale-105 p-2 rounded-lg",
            {
              "bg-emerald-500": viewMode === "active",
            }
          )}
        >
          진행중인 투표({activePolls.length})
        </button>
        <button
          onClick={() => setViewMode("inactive")}
          className={cx(
            "text-lg font-semibold duration-500 hover:scale-105 p-2 rounded-lg",
            {
              "bg-red-500": viewMode === "inactive",
            }
          )}
        >
          종료된 투표({inactivePolls.length})
        </button>
      </div>
      <div className="flex flex-wrap gap-5 justify-center">
        {polls.map((poll, index) => (
          <div
            key={`${poll.question}_${index}`}
            className={cx(
              { "a hidden": viewMode === "active" && !poll.isActive },
              { "a hidden": viewMode === "inactive" && poll.isActive },
              "p-10 w-96 bg-zinc-600 rounded-lg hover:scale-105 duration-500 cursor-pointer flex flex-col gap-3 shadow-md"
            )}
            onClick={() => handleNavigate(index)}
          >
            <div className="flex justify-between items-center">
              <p className="font-bold text-2xl truncate max-w-[80%]">
                {poll.question}
              </p>
              <p
                className={cx(
                  { "text-green-500": poll.isActive },
                  { "text-red-500": !poll.isActive }
                )}
              >
                {poll.isActive ? "진행중" : "종료됨"}
              </p>
            </div>
            {poll.voterAddresses.includes(account) ? (
              <p className="text-green-600 text-lg font-semibold">
                🍀 투표 완료
              </p>
            ) : (
              <p className="text-red-400 text-lg font-semibold">
                🗳️ 소중한 한 표가 필요합니다 !
              </p>
            )}

            {poll.candidates.slice(0, 3).map((candidate) => (
              <p key={candidate.name}>{candidate.name}</p>
            ))}
            {!poll.candidates.length && <p>아직 후보가 없습니다 !</p>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MainContent;
