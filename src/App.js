import { Button, Layout, Result, Skeleton } from 'antd';
import './App.less'
import React, { useEffect } from 'react';
import { useLiff } from 'react-liff';

const App = () => {
  const { error, liff, isLoggedIn, ready } = useLiff();

  useEffect(() => {
    if (!isLoggedIn) {
      liff.login()
    }
  }, [liff, isLoggedIn]);
  if (!ready) {
    return <Skeleton />
  }
  if (error) {
    console.error(error)
    return <Result status="500"/>
  }
  const handleScanCode = async () => {
    try {
    const result = await liff.scanCodeV2();
    console.log(result)
    } catch (e) {
      console.error(e)
    }
  }
  return (
    <React.Fragment>
      <Layout style={{minHeight: '100vh'}}>
        <Layout.Header>
          Header
        </Layout.Header>
        <Layout.Content>
          Body
          <Button onClick={handleScanCode}>Scan Code</Button>
        </Layout.Content>
        <Layout.Footer>
          Footer
        </Layout.Footer>
      </Layout>
    </React.Fragment>
  );
}

export default App;