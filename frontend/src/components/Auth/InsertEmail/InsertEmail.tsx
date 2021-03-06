import React from "react";
import classNames from "classnames";
import { ClassNamesFn } from "classnames/types";
import useSendEmail from "hooks/auth/useSendEmail";
import { FiArrowRight } from "react-icons/fi";
import { MetroSpinner } from "react-spinners-kit";
import Input from "components/common/Input";

const styles = require("./InsertEmail.scss");
const cx: ClassNamesFn = classNames.bind(styles);

const InsertEmail = () => {
  const {
    loading,
    warning,
    user,
    changeEmailHandler,
    submitEmailHandler,
  } = useSendEmail();
  const { email } = user;

  return (
    <div className={cx("insert-email")}>
      <div className={cx("insert-email-text")}>
        <h1 className={cx("insert-email-text-title")}>이메일 인증하기</h1>
        <p className={cx("insert-email-text-subtitle")}>
          이메일 인증 과정이 필요합니다. 본인의 이메일을 작성해주세요.
        </p>
      </div>
      <div className={cx("insert-email-input")}>
        <Input
          name="이메일"
          value={email}
          placeholder="이메일을 입력해주세요."
          onChangeHandler={changeEmailHandler}
          warning={warning}
        />
      </div>
      <div className={cx("insert-email-bottom")}>
        <button
          className={cx("insert-email-bottom-submit")}
          onClick={() => submitEmailHandler()}
        >
          {loading ? (
            <MetroSpinner size={38.4} color={"#ffffff"} />
          ) : (
            <FiArrowRight className={cx("insert-email-bottom-submit-icon")} />
          )}
        </button>
      </div>
    </div>
  );
};

export default InsertEmail;
