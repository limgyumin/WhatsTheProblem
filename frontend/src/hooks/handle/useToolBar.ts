import React, { useCallback, useEffect, useRef, useState } from "react";
import useClose from "hooks/util/useClose";
import useUpload from "hooks/upload/useUpload";

const useToolBar = (
  contentRef: React.MutableRefObject<HTMLTextAreaElement>,
  changeContentHandler: (content: string) => void
) => {
  const { imageRef, uploadHandler } = useUpload();

  const [link, setLink] = useState<string>("");
  const [isInputMount, setIsInputMount] = useState<boolean>(false);

  const linkInputRef = useRef<HTMLInputElement>(null);
  const clickRef = useRef<HTMLDivElement>(null);
  const linkRef = useRef<HTMLDivElement>(null);

  const setSelectionPos = useCallback(
    (start: number, end: number): void => {
      setTimeout(() => {
        contentRef.current.focus();
        contentRef.current.setSelectionRange(start, end);
      }, 0);
    },
    [contentRef]
  );

  const linkFocusHandler = useCallback((): void => {
    setTimeout(() => {
      linkInputRef.current.focus();
    }, 0);
  }, [linkInputRef]);

  const linkMountHandler = useCallback((): void => {
    setIsInputMount(true);
    linkFocusHandler();
  }, [setIsInputMount, linkFocusHandler]);

  const changeLinkHandler = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      const { value } = e.target;
      setLink(value);
    },
    [setLink]
  );

  const closeLinkHandler = useCallback((): void => {
    setIsInputMount(false);
    setLink("");
  }, [setLink, setIsInputMount]);

  useClose<HTMLDivElement>(clickRef, linkRef, closeLinkHandler);

  const submitLinkHandler = useCallback((): void => {
    const current = contentRef.current;

    const startPos: number = current.selectionStart;
    const endPos: number = current.selectionEnd;

    const content: string = current.value;

    const textBefore: string = content.substring(0, startPos);
    const textAfter: string = content.substring(endPos);

    const selected: string = content.substring(startPos, endPos);

    let linkText: string = selected;

    if (linkText.length === 0) {
      linkText = "?????? ?????????";
    }

    changeContentHandler(`${textBefore}[${linkText}](${link})${textAfter}`);
    setSelectionPos(startPos + 1, startPos + linkText.length + 1);
    setLink("");
    setIsInputMount(false);
  }, [
    link,
    contentRef,
    changeContentHandler,
    setSelectionPos,
    setIsInputMount,
  ]);

  const linkKeyDownHandler = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>): void => {
      const pressed: string = e.key;

      if (pressed === "Enter") {
        e.preventDefault();
        submitLinkHandler();
      }
    },
    [submitLinkHandler]
  );

  const changeImageHandler = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
      const { files } = e.target;

      const current = contentRef.current;

      const startPos: number = current.selectionStart;
      const endPos: number = current.selectionEnd;

      const content: string = current.value;

      const textBefore: string = content.substring(0, startPos);
      const textAfter: string = content.substring(endPos);

      const url: string = await uploadHandler(files);

      const imageText: string = `![](${url})\n`;

      changeContentHandler(`${textBefore}${imageText}${textAfter}`);
      setSelectionPos(startPos + imageText.length, startPos + imageText.length);
    },
    [contentRef, changeContentHandler, setSelectionPos, uploadHandler]
  );

  const toolsHandler = useCallback(
    (mode: string, scale?: number): void => {
      const current = contentRef.current;

      const startPos: number = current.selectionStart;
      const endPos: number = current.selectionEnd;

      const content: string = current.value;

      const slicedContent: string = content.slice(0, startPos);
      const lastNewLineIdx: number = slicedContent.lastIndexOf("\n");

      // ????????? ???????????? selection??? ???????????? ?????? ?????? ????????? \n??? index?????? (\n ?????? ??? ??????, ????????? ??? ??????)
      const textLineBefore: string = slicedContent.slice(0, lastNewLineIdx + 1);
      // ????????? \n??? index?????? ????????? ??????????????? (\n ?????? ??? ??????)
      const textLineAfter: string = content.slice(
        lastNewLineIdx + 1,
        content.length
      );

      let currentNewLineIdx: number = textLineAfter.indexOf("\n");

      if (currentNewLineIdx === -1) {
        currentNewLineIdx = textLineAfter.length;
      }

      // ??? ????????? ???????????? ??? \n??? index ?????? (????????? ?????? ??????)
      const lineText: string = textLineAfter.slice(0, currentNewLineIdx);
      // ??? ????????? ??? \n??? index?????? ??????????????? (????????? ??? ??????)
      const textLineBelow: string = textLineAfter.slice(
        currentNewLineIdx,
        textLineAfter.length
      );

      const textBefore: string = content.substring(0, startPos);
      const textAfter: string = content.substring(endPos);

      const selected: string = content.substring(startPos, endPos);

      // toolbar??? ???????????? ?????? handler?????? ????????? object?????? key???????????? ??????
      const handlers: { [key: string]: Function } = {
        heading: (): void => {
          const characters: string = "#".repeat(scale);
          const posScaleDiff: number = scale + 1;

          const isHeading: boolean = /^#{1,6} /.test(lineText);

          if (isHeading) {
            const replaced: string = lineText.replace(
              /^#{1,6} /,
              `${characters} `
            );

            const posDiff: number = replaced.length - lineText.length;

            changeContentHandler(
              `${textLineBefore}${replaced}${textLineBelow}`
            );
            setSelectionPos(startPos + posDiff, endPos + posDiff);
            return;
          }

          changeContentHandler(
            `${textLineBefore}${characters} ${lineText}${textLineBelow}`
          );
          setSelectionPos(startPos + posScaleDiff, endPos + posScaleDiff);
        },

        bold: (): void => {
          const isBold: boolean = /\*\*(.*)\*\*/.test(selected);

          if (isBold) {
            const replaced: string = selected.replace(/\*\*/g, "");

            changeContentHandler(`${textBefore}${replaced}${textAfter}`);
            setSelectionPos(startPos, startPos + selected.length - 4);
            return;
          }

          if (selected.length === 0) {
            const sample: string = "?????????";

            changeContentHandler(`${textBefore}**${sample}**${textAfter}`);
            setSelectionPos(startPos + 2, startPos + sample.length + 2);
            return;
          }

          changeContentHandler(`${textBefore}**${selected}**${textAfter}`);
          setSelectionPos(startPos, startPos + selected.length + 4);
        },

        italic: (): void => {
          const isItalic: boolean = /_(.*)_/.test(selected);

          if (isItalic) {
            const replaced: string = selected.replace(/_/g, "");

            changeContentHandler(`${textBefore}${replaced}${textAfter}`);
            setSelectionPos(startPos, startPos + selected.length - 2);
            return;
          }

          if (selected.length === 0) {
            const sample: string = "?????????";

            changeContentHandler(`${textBefore}_${sample}_${textAfter}`);
            setSelectionPos(startPos + 1, startPos + sample.length + 1);
            return;
          }

          changeContentHandler(`${textBefore}_${selected}_${textAfter}`);
          setSelectionPos(startPos, startPos + selected.length + 2);
        },

        strike: (): void => {
          const isBold: boolean = /~~(.*)~~/.test(selected);

          if (isBold) {
            const replaced: string = selected.replace(/~~/g, "");

            changeContentHandler(`${textBefore}${replaced}${textAfter}`);
            setSelectionPos(startPos, startPos + selected.length - 4);
            return;
          }

          if (selected.length === 0) {
            const sample: string = "?????????";

            changeContentHandler(`${textBefore}~~${sample}~~${textAfter}`);
            setSelectionPos(startPos + 2, startPos + sample.length + 2);
            return;
          }

          changeContentHandler(`${textBefore}~~${selected}~~${textAfter}`);
          setSelectionPos(startPos, startPos + selected.length + 4);
        },

        blockquote: (): void => {
          const isBlockQuote: boolean = /^> /.test(lineText);

          if (isBlockQuote) {
            const replaced: string = lineText.replace(/^> /, "");

            const posDiff: number = replaced.length - lineText.length;

            changeContentHandler(
              `${textLineBefore}${replaced}${textLineBelow}`
            );
            setSelectionPos(startPos + posDiff, endPos + posDiff);
            return;
          }

          changeContentHandler(
            `${textLineBefore}> ${lineText}${textLineBelow}`
          );
          setSelectionPos(startPos + 2, endPos + 2);
          return;
        },

        link: (): void => {
          linkMountHandler();
        },

        codeblock: (): void => {
          if (selected.length === 0) {
            const sample: string = "?????? ??????";

            changeContentHandler(
              `${textBefore}\`\`\`\n${sample}\n\`\`\`${textAfter}`
            );
            setSelectionPos(startPos + 4, startPos + sample.length + 4);
            return;
          }

          changeContentHandler(
            `${textBefore}\`\`\`\n${lineText}\n\`\`\`${textAfter}`
          );
          setSelectionPos(startPos + 4, startPos + selected.length + 4);
        },
      };

      const handler: Function = handlers[mode];
      if (!handler || (mode === "heading" && !scale)) return;

      handler();
    },
    [contentRef, changeContentHandler, setSelectionPos, linkMountHandler]
  );

  useEffect(() => {
    return () => {
      setLink("");
      setIsInputMount(false);
    };
  }, [setIsInputMount]);

  return {
    imageRef,
    clickRef,
    linkRef,
    linkInputRef,
    isInputMount,
    link,
    changeLinkHandler,
    changeImageHandler,
    submitLinkHandler,
    linkKeyDownHandler,
    toolsHandler,
  };
};

export default useToolBar;
