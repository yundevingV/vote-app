"use client";

import Web3 from "web3";
import React, { useEffect, useState } from "react";
import cx from "classnames";
import contractABI from "../abi/contractABI.json";
import { useRouter } from "next/navigation";

const Vote = () => {
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
          // await loadGetHasVoted(contractInstance, 1);
        } catch (error) {
          alert(
            "계약 호출에 오류가 발생했습니다. ABI와 계약 주소를 확인해 주세요."
          );
        }
      } else {
        alert("메타마스크를 설치해 주세요!");
      }
    };

    loadWeb3AndContract();
  }, []);

  // createPoll
  const [question, setQuestion] = useState();

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
  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-4xl font-bold mb-5">⛓️ 투표</h2>
      <p>모든 투표수 : {pollCount}</p>
      <div className="flex flex-wrap gap-5 justify-center">
        {polls.map((poll, index) => (
          <div
            key={index}
            className="p-10 bg-slate-50 rounded-lg hover:scale-105 duration-500 cursor-pointer flex flex-col gap-3"
            onClick={() => handleNavigate(index)}
          >
            <div className="flex justify-between">
              <p className="font-bold text-2xl">{poll.question}</p>
              <p
                className={cx(
                  { "text-green-500": poll.isActive },
                  { "text-red-500": !poll.isActive }
                )}
              >
                {poll.isActive ? "진행중" : "종료됨"}
              </p>
            </div>
            <p className="text-gray-400 text-sm">{poll.owner}</p>

            {poll.candidates.slice(0, 3).map((candidate) => (
              <p>{candidate.name}</p>
            ))}

            {poll.voterAddresses.includes(account) ? (
              <p className="text-green-600 text-lg font-semibold">
                🍀 투표 완료
              </p>
            ) : (
              <p className="text-red-400 text-lg font-semibold">
                🗳️ 소중한 한 표가 필요합니다 !
              </p>
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-5 gap-2">
        <input
          type="text"
          value={question}
          onChange={handleInputChange}
          placeholder="질문을 입력하세요"
          className="p-2 border border-gray-300 rounded"
        />
        <button
          onClick={() => handleCreatePoll(question)}
          className={cx(
            { "bg-gray-400": !question },
            "cursor-pointer px-3 py-1 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
          )}
          disabled={!question}
        >
          투표 만들기
        </button>
      </div>
    </div>
  );
};

export default Vote;
