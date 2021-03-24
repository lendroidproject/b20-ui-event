import React, { useEffect, useState, useMemo, useCallback } from 'react'
import ReactDOM from 'react-dom'
import styled from 'styled-components'
import Button from 'components/common/Button'
import Input from 'components/common/Input'
import BigNumber from 'bignumber.js'

const Wrapper = styled.div`
  position: fixed;
  z-index: -101;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  opacity: 0;
  background: transparent;
  transition: all 0.2s;

  &.show {
    z-index: 101;
    opacity: 1;
    background: var(--color-opacity09);
  }
`

const Content = styled.div`
  width: 885px;
  max-width: 95%;
  background: rgba(255,255,255,0.7);
  padding: 30px 30px 50px;
  border-radius: 6px;

  .modal-header {
    text-align: center;
    border-bottom: 2px solid var(--color-pink);
    margin: auto;
    margin-bottom: 24px;
    width: 423px;
    max-width: 100%;
    h1 {
      font-size: 32px;
      padding-bottom: 24px;
    }
  }

  .modal-body {
    width: 423px;
    max-width: 100%;
    margin: auto;
    padding: 30px;
    position: relative;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    background-color: #fbfbfb;
    box-shadow: 0 6px 8px 0 rgba(0,0,0,0.5);
  }

  .modal-content {
    width: 100%;
    border-radius: 4px;
    background-color: #FBFBFB;
    box-shadow: 0 2px 15px 0 rgba(0,0,0,0.14);
    padding: 20px;
    margin-top: 25px;
  }
  
  .btn-close {
    font-size: 20px;
    font-weight: bold;
    letter-spacing: 0;
    line-height: 24px;
    background: transparent;
    padding: 0;
    > img {
      width: 33px;
      height: 16px;
      margin-right: 10px;
    }
  }
  .input .suffix {
    width: unset;
    color: var(--color-grey);
    > img {
      width: 24px;
      border-radius: 12px;
    }
  }
  .message {
    font-size: 11px;
    color: var(--color-grey);
    margin-top: 8px;
    margin-bottom: 20px;
    line-height: 17px;
    display: flex;
    justify-content: space-between;

    &.error {
      color: var(--color-red);
    }
  }
  .modal-footer {
    margin-top: 36px;
    text-align: center;
    button {
      min-width: 175px;
    }
  }
`

const MIN_B20_AMOUNT = 500000

function BidModal({
  minTotal = 0,
  b20Balance = 0,
  daiBalance = 0,
  b20Allowance = 0,
  daiAllowance = 0,
  getRequiredB20,
  show,
  onHide,
  onContinue,
  onApproveB20,
  onApproveDai,
}) {
  const [formData, setFormData] = useState({
    total: {
      value: '',
      hasError: false,
      isValid: false,
      error: ''
    },
    dai: {
      value: '',
      hasError: false,
      isValid: false,
      error: ''
    },
    b20: {
      value: '',
      hasError: false,
      isValid: false,
      error: ''
    },
  })
  const [minB20, setMinB20] = useState(MIN_B20_AMOUNT)

  const totalValidator = useCallback((value) => (value >= minTotal), [minTotal])
  const daiValidator = useCallback((value) => (value >= 0 && value <= formData.total.value), [formData.total.value])
  const b20Validator = useCallback((value) => (value >= minB20), [minB20])

  const validators = {
    total: totalValidator,
    dai: daiValidator,
    b20: b20Validator,
  }

  const handleChange = (e) => {
    const name = e.target.name
    const value = Number(e.target.value)
    const isValid = validators[name](value)
    setFormData({
      ...formData,
      [name]: {
        value,
        hasError: !isValid,
        isValid,
        error: ''
      }
    })
  }

  const input1Suffix = () => (
    <div className="suffix">
      <img className="asset-icon" src="/assets/dai.svg" alt="DAI" />
      &nbsp;+&nbsp;
      <img className="asset-icon" src="/assets/b20.svg" alt="B20" />
    </div>
  )
  const input2Suffix = () => (
    <div className="suffix">
      <img className="asset-icon" src="/assets/dai.svg" alt="DAI" />
    </div>
  )
  const input3Suffix = () => (
    <div className="suffix">
      <img className="asset-icon" src="/assets/b20.svg" alt="B20" />
    </div>
  )

  useEffect(() => {
    const getMinB20 = async () => {
      const result = await getRequiredB20(formData.total.value, formData.dai.value);
      setMinB20(Math.max(result, MIN_B20_AMOUNT))
    }
    getMinB20()
  }, [getRequiredB20, formData.total.value, formData.dai.value])

  return ReactDOM.createPortal(
    <Wrapper className={`flex-all ${show ? 'show' : 'hide'}`} onMouseDown={() => onHide && onHide()}>
      <Content onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h1 className="col-blue modal-title">Buyout</h1>
        </div>
        <div className="modal-body">
          <button className="btn-close" onClick={() => onHide && onHide()}>
            <img src="/assets/arrow-right-black.svg" />Go Back
          </button>
          <div className="modal-content">
            <div className="form-input">
              <Input
                id="total"
                name="total"
                label="Total Bid Value"
                value={formData.total.value}
                onChange={handleChange}
                pattern="/^\s*\d+(\.\d{1,2})?\s*$/"
                suffix={input1Suffix}
              />
              <div className={`message${formData.total.hasError ? ' error' : ''}`}>
                <span>Min. Required: {minTotal}</span>
                {/* {errors.total && `Insufficient ${token1Name} balance.`} */}
              </div>
            </div>
            {formData.total.isValid && (
              <>
                <div className="form-input">
                  <Input
                    id="dai"
                    name="dai"
                    label="DAI"
                    value={formData.dai.value}
                    onChange={handleChange}
                    pattern="/^\s*\d+(\.\d{1,2})?\s*$/"
                    suffix={input2Suffix}
                  />
                  <div className={`message${formData.dai.hasError ? ' error' : ''}`}>
                    <span>Max: {formData.total.value}</span>
                    <span>Balance: {daiBalance}</span>
                  </div>
                </div>
                <div className="form-input">
                  <Input
                    id="b20"
                    name="b20"
                    label="B20"
                    value={formData.b20.value}
                    onChange={handleChange}
                    pattern="/^\s*\d+(\.\d{1,2})?\s*$/"
                    suffix={input3Suffix}
                  />
                  <div className={`message${formData.b20.hasError ? ' error' : ''}`}>
                    <span>Min. Required: {minB20}</span>
                    <span>Balance: {b20Balance}</span>
                    {/* {errors.total && `Insufficient ${token1Name} balance.`} */}
                  </div>
                </div>
              </>
            )}
            <div className="modal-footer">
              {daiAllowance < formData.dai.value ? (
                <Button
                  onClick={() => onApproveDai && onApproveDai(formData.dai.value)}
                >
                  <span>Approve DAI</span>
                </Button>
              ) : b20Allowance < formData.b20.value ? (
                <Button
                  onClick={() => onApproveB20 && onApproveB20(formData.b20.value)}
                >
                  <span>Approve B20</span>
                </Button>
              ) : (
                <Button
                  onClick={() => onContinue && onContinue(formData.total.value, formData.dai.value)}
                  disabled={!formData.total.isValid || !formData.dai.isValid || !formData.b20.isValid}
                >
                  <span>Continue</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </Content>
    </Wrapper>,
    document.body
  )
}

export default BidModal