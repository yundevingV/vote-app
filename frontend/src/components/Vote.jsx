"use client";

import Web3 from "web3";
import React, { useEffect, useState } from "react";
import cx from "classnames";
import contractABI from "../abi/contractABI.json";

const Vote = () => {
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [candidateName, setCandidateName] = useState("");
  const [candidates, setCandidates] = useState([]);

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
      }
    };

    if (!candidates) return;
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

  // addCandidate
  const addCandidate = async () => {
    if (!contract && !candidateName) return;

    // 후보자 등록
    await contract.methods.addCandidate(candidateName).send({ from: account });

    setCandidateName("");
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
    const voterStatus = result[4];

    const newPolls = questions.map((question, index) => ({
      question,
      owner: owners[index],
      isActive: isActive[index],
      candidates: candidates[index],
      voterStatus: voterStatus[index],
    }));

    setPolls(newPolls);
  };

  //getHasVoted
  const [hasVotedIndex, setHasVotedIndex] = useState(false);

  const loadGetHasVoted = async (index) => {
    const result = await contract.methods.getHasVoted(index).call();
    setHasVotedIndex(result);
  };

  const handleInputChange = (event) => {
    const value = event.target.value;
    setQuestion(value);
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-4xl font-bold mb-5">투표</h2>
      <p>모든 투표수 : {pollCount}</p>
      <div className="flex flex-wrap gap-5 justify-center">
        {polls.map((poll, index) => (
          <div key={index} className="p-5 bg-slate-50 rounded-lg ">
            <p className="font-bold text-2xl">{poll.question}</p>
            <p>made by {poll.owner}</p>
            <p>{poll.isActive ? "진행중" : "종료됨"}</p>
            <h3>Candidates:</h3>
            <ul>
              {poll.candidates.map((candidate, candidateIndex) => (
                <li key={candidateIndex}>
                  {candidate.name} - Votes: {candidate.upVote}
                </li>
              ))}
            </ul>
            {/* <h3>Voter Status: {hasVotedIndex}</h3> */}
          </div>
        ))}
      </div>
      {/* <div className="flex flex-col gap-10 ">
        {candidates.map((candidate, index) => (
          <div
            key={index}
            className={cx(
              {
                "border-2 border-red-500 transition-transform duration-300 translate-x-3":
                  activeCandidate === index,
              },
              "p-6 border-gray-300 shadow-xl rounded-lg flex flex-col gap-2 hover:transition-transform hover:duration-300 hover:translate-x-3"
            )}
            onClick={() => setActiveCandidate(index)}
          >
            <div className="flex justify-between">
              <p className="font-bold text-2xl">{candidate.name}</p>
              <p className="font-bold text-2xl">
                {candidate.upVote > 0 && totalVotes > 0
                  ? `${Math.floor(
                      (Number(candidate.upVote) / Number(totalVotes)) * 100
                    )} %`
                  : "0%"}
              </p>
            </div>
            <div className="relative w-full h-2 bg-gray-200 rounded">
              <div
                className="absolute h-full bg-red-400 rounded"
                style={{
                  width: `
                        ${
                          (Number(candidate.upVote) / Number(totalVotes)) * 100
                        }%`,
                }}
              ></div>
            </div>
            <div className="flex justify-between">
              <p className="text-gray-400">{candidate.upVote} 표</p>
            </div>
          </div>
        ))}
      </div> */}
      {/* <div className="flex justify-center mt-5">
        <button
          onClick={() => handleVote(activeCandidate)}
          className="cursor-pointer p-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
          disabled={!activeCandidate}
        >
          투표하기
        </button>
      </div> */}

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

      {/* {isOwner && (
        <form
          className="mt-10"
          onSubmit={(e) => {
            e.preventDefault();
            addCandidate();
          }}
        >
          <input
            type="text"
            value={candidateName}
            onChange={(e) => setCandidateName(e.target.value)}
            placeholder="후보자 이름"
            required
            className="p-4 w-96 h-12 bg-slate-50 rounded-lg"
          />

          <button type="submit"> 등록</button>
        </form>
      )} */}
    </div>
  );
};

export default Vote;
