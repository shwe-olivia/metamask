import Head from 'next/head'
import { useEffect, useState } from 'react';
import detectEthereumProvider from '@metamask/detect-provider';
import toast, { Toaster } from 'react-hot-toast';

const MetaMaskIndex = () => {

  const [metaMaskInfo, setMetaMaskInfo] = useState({
    connected: false,
    currentAddress: [],
    currentChain: '',
    loading: false
  })

  useEffect(() => {
    onCheckMetaMask();
  }, [])

  const onCheckMetaMask = async() => {
    const provider = await detectEthereumProvider();
    if (provider) {
      if(provider.isMetaMask){
        setMetaMaskInfo((prevState) => ({
            ...prevState,
            connected: true,
        }));
        /* connectHandler(provider.isMetaMask); */
      } else {
        setMetaMaskInfo((prevState) => ({
            ...prevState,
            connected: false,
        }));
      }
    }
  }

  const connectHandler = (isMetaMask) => {
    if(isMetaMask){
      requestAccountHandler();
      checkChainId();
    }
  }


  const checkChainId = async () => {
    const provider = await detectEthereumProvider();
    if(provider){
      const currentChainId = await provider.request({
        method: 'eth_chainId',
      });
      setMetaMaskInfo((prevState) => ({
          ...prevState,
          currentChain: currentChainId,
      }));
    }
  }

  const requestAccountHandler = async () =>{
    const provider = await detectEthereumProvider();
    setMetaMaskInfo((prevState) => ({
        ...prevState,
        loading: true
    }));
    /* const request = await providerInfo.request({ method: 'eth_requestAccounts' }); */
    provider.request({ method: "eth_requestAccounts" }).then((accounts) => {
      setMetaMaskInfo((prevState) => ({
          ...prevState,
          loading: false,
          currentAddress: accounts
      }));
    }).catch((err) => {
      toast.error(err.message, {
        duration: 6000,
        position: 'bottom-right'
      });
      setMetaMaskInfo((prevState) => ({
          ...prevState,
          loading: false,
          currentAddress: []
      }));
    })
  }

  useEffect(() => {
    if(window.ethereum){
      updateListener(window.ethereum);
      return () => removeUpdateListener(window.ethereum);
    }
  }, []);

  const updateListener = (ethereum) => {
    ethereum.on("chainChanged", checkChainId);
    ethereum.on("accountsChanged", requestAccountHandler);
  };
  
  const removeUpdateListener = (ethereum) => {
    ethereum.removeListener("chainChanged", checkChainId);
    ethereum.removeListener("accountsChanged", requestAccountHandler);
  };

  return (
    <>
      <Head>
        <title>NFI x Shwe assignment</title>
        <meta name="description" content="NFI x Shwe assignment" />
        <link rel="icon" href="https://nfi.io/images/header/NFI-logo.png" />
      </Head>

      <div className="container text-center py-5 mt-5">
        <h1 className="mb-5">{
          metaMaskInfo.connected ?
          metaMaskInfo.currentAddress.length > 0 ? `You are now connecting metamask with this account`: 'Click this button to connect to web3 wallet (metamask)'
          : 'You need to install the MetaMask on your browser'
        }</h1>
        {metaMaskInfo.connected && metaMaskInfo.currentAddress.length == 0 ?
          <button type="button" onClick={()=>connectHandler(metaMaskInfo.connected)} className="btn btn-outline-light" disabled={metaMaskInfo.loading}>Connect</button>
            :
          <>
            <h5 className="text-break">{metaMaskInfo.currentAddress[0]}</h5>

            {metaMaskInfo.currentChain!='' && 
              <div>
                <span className="w-100 d-inline-block mt-5 mb-2">Current Network</span>
                <h6 className="h5">{metaMaskInfo.currentChain}</h6>
              </div>
            }
          </>
        }
        <Toaster />
      </div>
    </>
  )
}
export default MetaMaskIndex;
