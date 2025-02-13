"use client";
import Web3 from "web3";
import contractABI from "../../abi/contractABI.json";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

const VoteDetail = () => {
  const searchParams = useSearchParams();

  const pollId = searchParams.get("id");
  console.log(pollId);
  const [contract, setContract] = useState(null);

  const [candidates, setCandidates] = useState([]);
  const [account, setAccount] = useState("");

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
          await loadGetPollResult(contractInstance);
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

  // vote <- vote detail
  const [voteIndex, setVoteIndex] = useState(-1);

  const handleVote = async () => {
    if (!contract || voteIndex < 0) return;
    await contract.methods.vote(pollId, voteIndex).send({ from: account });

    setVoteIndex(-1);
  };

  // getPollResults <- vote detail
  const [poll, setPoll] = useState([]);

  const loadGetPollResult = async (contractInstance) => {
    const newPoll = await contractInstance.methods
      .getPollResults(pollId)
      .call();

    setPoll(newPoll);
  };

  // addCandidate
  const [candidateName, setCandidateName] = useState("");

  const handleAddCandidate = async () => {
    if (!contract && !candidateName) return;

    // 후보자 등록
    await contract.methods
      .addCandidate(pollId, candidateName)
      .send({ from: account });

    setCandidateName("");
  };

  return (
    <>
      {pollId}

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
    </>
  );
};

export default VoteDetail;
