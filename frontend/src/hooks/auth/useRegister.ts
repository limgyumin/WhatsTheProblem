import { createUserState } from "atom/auth.atom";
import { REGISTER } from "graphql/auth/auth.mutation";
import React from "react";
import { useCallback, useEffect, useState } from "react";
import { useHistory } from "react-router";
import { useRecoilState } from "recoil";
import { isInvalidString } from "lib/isInvalidString";
import { passwordRegExp } from "constants/regExp/passwordRegExp";
import { nameRegExp } from "constants/regExp/nameRegExp";
import { IRegisterResult } from "types/user/user.result.type";
import { useMutation } from "@apollo/client";
import { setCookie } from "lib/cookie";
import { useToasts } from "react-toast-notifications";
import { ICreateUser } from "types/user/user.type";
import { idRegExp } from "constants/regExp/idRegExp";
import { initialCreateUser } from "types/user/user.initial-state";

const useRegister = () => {
  const { addToast } = useToasts();
  const history = useHistory();
  const [register] = useMutation<IRegisterResult>(REGISTER);

  const [user, setUser] = useRecoilState<ICreateUser>(createUserState);
  const [passwordWarning, setPasswordWarning] = useState<string>("");
  const [nameWarning, setNameWarning] = useState<string>("");
  const [idWarning, setIdWarning] = useState<string>("");

  const changePasswordHandler = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      const { value } = e.target;
      setUser({ ...user, password: value });
    },
    [user, setUser]
  );

  const changeNameHandler = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      const { value } = e.target;
      setUser({ ...user, name: value });
    },
    [user, setUser]
  );

  const changeIdHandler = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      const { value } = e.target;
      setUser({ ...user, id: value });
    },
    [user, setUser]
  );

  const changeBioHandler = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      const { value } = e.target;
      setUser({ ...user, bio: value });
    },
    [user, setUser]
  );

  const validate = useCallback((): boolean => {
    const { password, name, id } = user;

    const [invalidPassword, invalidName, invalidId] = [
      isInvalidString(password, passwordRegExp),
      isInvalidString(name, nameRegExp),
      isInvalidString(id, idRegExp),
    ];

    if (invalidPassword) {
      setPasswordWarning(
        "??????????????? 6 ~ 20??? ????????? ?????? ??????????????? ?????? 1??? ????????? ?????? ?????? ??????????????? ???????????? ?????????."
      );
    } else {
      setPasswordWarning("");
    }

    if (invalidName) {
      setNameWarning(
        "????????? 2 ~ 16??? ????????? ??????, ??????, ?????? ????????? ????????????????????????."
      );
    } else {
      setNameWarning("");
    }

    if (invalidId) {
      setIdWarning(
        "???????????? 4 ~ 30??? ????????? ??????, ?????? ????????? ????????????????????????."
      );
    } else {
      setIdWarning("");
    }

    return !(invalidPassword || invalidName || invalidId);
  }, [user]);

  const submitUserHandler = useCallback(async (): Promise<void> => {
    if (!validate()) return;

    try {
      const { data } = await register({ variables: { user } });

      if (data) {
        setCookie("token", data.register);
        addToast(
          "??????????????? ???????????? ????????????. ?????? What'sTheProblem??? ??????????????????!",
          { appearance: "success" }
        );
        setUser(initialCreateUser);
        history.push("/");
      }
    } catch (error) {
      if (error.message.includes("User already exist.")) {
        setIdWarning("?????? ???????????? ??????????????????.");
      } else {
        addToast("????????? ????????? ???????????? ?????? ????????? ???????????????...", {
          appearance: "error",
        });
        history.push("/");
      }
    }
  }, [history, user, validate, register, addToast, setUser]);

  useEffect(() => {
    if (!user.email) {
      history.push("/");
    }
    return () => {
      setNameWarning("");
      setPasswordWarning("");
    };
  }, [user, history]);

  return {
    user,
    passwordWarning,
    nameWarning,
    idWarning,
    changePasswordHandler,
    changeNameHandler,
    changeIdHandler,
    changeBioHandler,
    submitUserHandler,
  };
};

export default useRegister;
