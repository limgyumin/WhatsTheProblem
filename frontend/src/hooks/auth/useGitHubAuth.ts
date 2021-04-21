import { gitHubUserState } from "atom/auth.atom";
import { GITHUB_AUTH, GITHUB_USER } from "graphql/auth/auth.mutation";
import { useCallback, useEffect, useState } from "react";
import { useHistory } from "react-router";
import { useRecoilState } from "recoil";
import cookie from "js-cookie";
import { IGitHubUser } from "types/user/user.type";
import { isInvalidString } from "lib/isInvalidString";
import useQueryString from "hooks/util/useQueryString";
import { nameRegExp } from "constants/regExp/nameRegExp";
import { ApolloError, useMutation } from "@apollo/client";
import { createToken } from "lib/token";
import {
  IGitHubAuthResult,
  IGitHubUserResult,
} from "types/user/user.result.type";
import { setCookie } from "lib/cookie";
import { useToasts } from "react-toast-notifications";

const useGitHubAuth = () => {
  const code: string = useQueryString("code");
  const history = useHistory();
  const { addToast } = useToasts();

  const [gitHubUser] = useMutation<IGitHubUserResult>(GITHUB_USER);
  const [gitHubAuth] = useMutation<IGitHubAuthResult>(GITHUB_AUTH);

  const [user, setUser] = useRecoilState<IGitHubUser>(gitHubUserState);
  const [warning, setWarning] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const changeNameHandler = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      const { value } = e.target;
      setUser({ ...user, name: value });
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

  const gitHubUserHandler = useCallback(async (): Promise<void> => {
    setLoading(true);
    await gitHubUser({
      variables: { code },
    })
      .then((res) => {
        if (res.data) {
          const gitHubUser = res.data.gitHubUser;

          if (!gitHubUser.isNew) {
            cookie.set("token", createToken(gitHubUser));
            setLoading(false);
            addToast(
              "성공적으로 로그인 되었어요. 이제 What'sTheProblem과 함께해봅시다!",
              { appearance: "success" }
            );
            history.push("/");
          }

          delete gitHubUser.isNew;

          setUser(gitHubUser);
          setLoading(false);
        }
      })
      .catch((err: ApolloError) => {
        history.push("/");
      });
  }, [code, history, gitHubUser, setUser, setLoading, addToast]);

  const validate = (name: string): boolean => {
    if (isInvalidString(name, nameRegExp)) {
      setWarning(
        "이름은 2 ~ 16자 이내의 한글, 영어, 또는 숫자로 이루어져야합니다."
      );
      return false;
    }

    setWarning("");
    return true;
  };

  const submitUserHandler = useCallback(async (): Promise<void> => {
    const { name } = user;

    if (!validate(name)) return;

    await gitHubAuth({
      variables: { user },
    })
      .then((res) => {
        if (res.data) {
          setCookie("token", res.data.gitHubAuth);
          addToast(
            "성공적으로 로그인 되었어요. 이제 What'sTheProblem과 함께해봅시다!",
            { appearance: "success" }
          );
          history.push("/");
        }
      })
      .catch((err: ApolloError) => {
        history.push("/");
      });
  }, [user, history, gitHubAuth, addToast]);

  useEffect(() => {
    gitHubUserHandler();

    return () => {
      setWarning("");
      setLoading(false);
    };
  }, [gitHubUserHandler]);

  return {
    loading,
    warning,
    user,
    changeNameHandler,
    changeBioHandler,
    submitUserHandler,
  };
};

export default useGitHubAuth;
