import { Button, Col, Layout, Result, Row, Skeleton, Form, Input } from 'antd';
import './App.less'
import React, { useEffect, useState } from 'react';
import { useLiff } from 'react-liff';
import axios from 'axios';
import { useAsync, useLocalStorage } from 'react-use';
import _ from 'lodash'
import qs from 'qs'

const App = () => {
  const [APIKey, setAPIKey, removeAPIKey] = useLocalStorage('api-key');
  const { error, liff, isLoggedIn, ready } = useLiff();
  useEffect(() => {
    if (!isLoggedIn) {
      liff.login()
      return
    }
  }, [liff, isLoggedIn]);
  const {
    value: event
  } = useAsync(async () => {
    if (!APIKey) {
      return Promise.resolve()
    }
    const result = await axios.get(`https://hackathailand.com/wp-json/wp/v2/tribe_events?meta_key=_et_event_api_key&meta_value=${APIKey}`).then(res => res.data)
    const event = _.get(result, 0)
    return event
  }, [APIKey])
  useEffect(() => {
    if (event) {
      handleScanCode()
    }
  }, [event])
  
  const handleScanCode = async () => {
    if (!event) {
      return Promise.resolve()
    }
    try {
      const result = await liff.scanCodeV2();
      const url = new URL(result.value)
      const {
        userid,
        event_qr_code,
        ticket_id,
        event_id,
        security_code,
      } = qs.parse(url.search, {
        ignoreQueryPrefix: true
      })
      // get attendee info
      // https://hackathailand.com/wp-json/wp/v2/tribe_rsvp_attendees?meta_key[]=_tribe_rsvp_event&meta_value[]=11067&meta_key[]=_tribe_rsvp_security_code&meta_value[]=390d6f7dd2
      debugger
      const attendees = await axios.get(`https://hackathailand.com/wp-json/wp/v2/tribe_rsvp_attendees?meta_key[]=_tribe_rsvp_event&meta_value[]=${event.id}&meta_key[]=_tribe_tickets_attendee_user_id&meta_value[]=${userid}`).then(res => res.data)
      const checkinResult = await Promise.all(attendees.map(async attendee => {
        const {
          _tribe_rsvp_security_code: securityCode,
          id: ticketId
        } = attendee
        const checkindata = {
          "event_qr_code": 1,
          "ticket_id": `${ticketId}`,
          "event_id": event.id,
          "security_code": securityCode,
          "api_key": APIKey
        }
        // "{"event_qr_code":1,"ticket_id":"2410","event_id":11067,"security_code":"a9eb9bf6fb","api_key":"14bf33e4"}"
        // "Missing parameter(s): api_key, ticket_id, security_code"
        try {
          const checkinResult = await axios.post(`https://hackathailand.com/wp-json/tribe/tickets/v1/qr`, checkindata).then(res => res.data)
          alert('Checked in')
          return checkinResult
        } catch (e) {
          console.log(e)
          alert('Already checked in')
          return Promise.reject(e)
        }
      }))
      console.log(checkinResult)
      debugger
    } catch (e) {
      console.error(e)
      debugger
    }
    handleScanCode()
  }
  if (!ready) {
    return <Skeleton />
  }
  if (error) {
    console.error(error)
    return <Result status="500"/>
  }
  if (!APIKey) {
    return (
      <React.Fragment>
        <Row justify="center" style={{paddingTop: 80}}>
          <Col>
            <Form layout="vertical" onFinish={({apiKey}) => {
              setAPIKey(apiKey)
            }}>
              <Form.Item label="API Key" name="apiKey" rules={[{required: true}]}>
                <Input />
              </Form.Item>
              <Form.Item>
                <Button htmlType="submit" type="primary">
                  Continue
                </Button>
              </Form.Item>
            </Form>
          </Col>
        </Row>
      </React.Fragment>
    )
  }
  if (!event) {
    return <Skeleton />
  }
  return (
    <React.Fragment>
      <Layout style={{minHeight: '100vh'}}>
        <Layout.Content style={{padding: 40}}>
          <Row justify="center">
            <Col>
              <Button onClick={handleScanCode}>Scan Code</Button>
            </Col>
          </Row>
        </Layout.Content>
        <Layout.Footer>
          <Row justify="end">
            <Col>
              <Button danger type="primary" onClick={() => removeAPIKey()}>Logout</Button>
            </Col>
          </Row>
        </Layout.Footer>
      </Layout>
    </React.Fragment>
  );
}

export default App;