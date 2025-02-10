"use client";

import Web3 from "web3";
import React, { useEffect, useState } from "react";

const Vote = () => {
  const [account, setAccount] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [contract, setContract] = useState(null);
  const [candidateName, setCandidateName] = useState("");
  const [candidates, setCandidates] = useState([]);

  // 스마트 콘트랙트 주소
  const contractAddress = "0xa34E61274791CDEA9775d273d6f254a41F788070";

  // abi 주소
  const contractABI = [
    {
      inputs: [],
      stateMutability: "nonpayable",
      type: "constructor",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "string",
          name: "name",
          type: "string",
        },
      ],
      name: "AddCandidate",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint256",
          name: "index",
          type: "uint256",
        },
      ],
      name: "DeleteCandidate",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "bool",
          name: "live",
          type: "bool",
        },
      ],
      name: "FinishVote",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "string",
          name: "candidate",
          type: "string",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "upVote",
          type: "uint256",
        },
      ],
      name: "UpVote",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "owner",
          type: "address",
        },
      ],
      name: "Voting",
      type: "event",
    },
    {
      inputs: [
        {
          internalType: "string",
          name: "_name",
          type: "string",
        },
      ],
      name: "addCandidate",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256",
        },
      ],
      name: "candidateList",
      outputs: [
        {
          internalType: "string",
          name: "name",
          type: "string",
        },
        {
          internalType: "uint256",
          name: "upVote",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_index",
          type: "uint256",
        },
      ],
      name: "deleteCandidate",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "finishVote",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "getAllCandidates",
      outputs: [
        {
          components: [
            {
              internalType: "string",
              name: "name",
              type: "string",
            },
            {
              internalType: "uint256",
              name: "upVote",
              type: "uint256",
            },
          ],
          internalType: "struct Vote.candidate[]",
          name: "",
          type: "tuple[]",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "isOwner",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_index",
          type: "uint256",
        },
      ],
      name: "upVote",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
  ];

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
        await loadCandidates(contractInstance);
        const isOwner = await contractInstance.methods.isOwner().call();
        setIsOwner(isOwner);

        try {
          await contractInstance.methods.getAllCandidates().call();
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

  const loadCandidates = async (contractInstance) => {
    try {
      const allCandidates = await contractInstance.methods
        .getAllCandidates()
        .call();
      setCandidates(allCandidates);
    } catch (error) {
      console.error("Error loading candidates:", error);
      alert("네트워크에 오류가 생겼습니다.");
    }
  };

  const addCandidate = async () => {
    if (contract && candidateName) {
      await contract.methods
        .addCandidate(candidateName)
        .send({ from: account });
      console.log("후보자가 추가되었습니다.");
      setCandidateName(""); // 인풋 초기화
      await loadCandidates(contract); // 후보자 목록 다시 불러오기
    }
  };
  const deleteCandidate = async (index) => {
    try {
      if (contract && index != null) {
        await contract.methods.deleteCandidate(index).send({ from: account });
        await loadCandidates(contract);
      }
    } catch (error) {
      console.error("Error deleting candidate:", error);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-gray-100 rounded-lg shadow-md">
      {/* <h1 className="text-xl font-bold text-center">계정: {account}</h1> */}
      <p>{isOwner}</p>
      <h2 className="text-lg font-semibold"> 개발팀</h2>
      <h2 className="text-base ">🍚 점심회식 장소</h2>

      <ul className="mt-2">
        {candidates.map((candidate, index) => (
          <li key={index} className="py-2 border-b border-gray-300">
            <p>{index} 번 후보</p>
            <p>
              {candidate.name} - {candidate.upVote}표
            </p>
            <p onClick={() => deleteCandidate(index)}>삭제하기</p>
          </li>
        ))}
      </ul>
      <input
        type="text"
        value={candidateName}
        onChange={(e) => setCandidateName(e.target.value)}
        placeholder="후보자 이름 입력"
        className="w-full p-2 mt-4 border border-gray-300 rounded"
      />
      <button
        onClick={addCandidate}
        className="w-full py-2 mt-4 bg-green-500 text-white rounded hover:bg-green-600"
      >
        투표 하기
      </button>

      <button
        onClick={addCandidate}
        className="w-full py-2 mt-4 bg-green-500 text-white rounded hover:bg-green-600"
      >
        후보 메뉴 추가
      </button>
    </div>
  );
};

export default Vote;
