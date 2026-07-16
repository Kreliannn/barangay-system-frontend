import Swal from "sweetalert2"
import { toast } from "sonner"
import React from "react"

export const successAlert = (text: string) => {
  toast.custom(() =>
    React.createElement(
      "div",
      {
        style: {
          position: "relative",
          display: "flex",
          alignItems: "flex-start",
          gap: "16px",
          background: "#121212",
          border: "1px solid #242424",
          padding: "16px 20px",
          overflow: "hidden",
          width: "360px",
          fontFamily: "system-ui, sans-serif",
        },
      },
      React.createElement("div", { style: { position: "absolute", left: 0, top: 0, height: "100%", width: "2px", background: "#C9A84C" } }),
      React.createElement("div", { style: { position: "absolute", top: 0, right: 0, width: "24px", height: "24px", borderTop: "1px solid #C9A84C", borderRight: "1px solid #C9A84C", opacity: 0.4 } }),
     
      React.createElement(
        "div",
        {
          style: {
            flexShrink: 0,
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid #C9A84C",
            background: "rgba(201,168,76,0.08)",
          },
        },
        React.createElement(
          "svg",
          { width: 15, height: 15, viewBox: "0 0 24 24", fill: "none", stroke: "#C9A84C", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" },
          React.createElement("path", { d: "M22 11.08V12a10 10 0 1 1-5.93-9.14" }),
          React.createElement("polyline", { points: "22 4 12 14.01 9 11.01" })
        )
      ),
      React.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 } },
        React.createElement("p", {
          style: { margin: 0, fontSize: "14px", fontWeight: 300, letterSpacing: "0.06em", color: "#F2EDE4", fontFamily: "'Cormorant Garamond', serif" },
        }, "Success"),
        React.createElement("p", {
          style: { margin: 0, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.14em", color: "#7A7570", lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
        }, text)
      )
    )
  )
}

export const errorAlert = (text: string) => {
  toast.custom(() =>
    React.createElement(
      "div",
      {
        style: {
          position: "relative",
          display: "flex",
          alignItems: "flex-start",
          gap: "16px",
          background: "#121212",
          border: "1px solid #242424",
          padding: "16px 20px",
          overflow: "hidden",
          width: "360px",
          fontFamily: "system-ui, sans-serif",
        },
      },
      React.createElement("div", { style: { position: "absolute", left: 0, top: 0, height: "100%", width: "2px", background: "#8B3A3A" } }),
      React.createElement("div", { style: { position: "absolute", top: 0, right: 0, width: "24px", height: "24px", borderTop: "1px solid #8B3A3A", borderRight: "1px solid #8B3A3A", opacity: 0.4 } }),
      
      React.createElement(
        "div",
        {
          style: {
            flexShrink: 0,
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "1px solid #8B3A3A",
            background: "rgba(139,58,58,0.08)",
          },
        },
        React.createElement(
          "svg",
          { width: 15, height: 15, viewBox: "0 0 24 24", fill: "none", stroke: "#C26060", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" },
          React.createElement("circle", { cx: 12, cy: 12, r: 10 }),
          React.createElement("line", { x1: 15, y1: 9, x2: 9, y2: 15 }),
          React.createElement("line", { x1: 9, y1: 9, x2: 15, y2: 15 })
        )
      ),
      React.createElement(
        "div",
        { style: { display: "flex", flexDirection: "column", gap: "2px", minWidth: 0 } },
        React.createElement("p", {
          style: { margin: 0, fontSize: "14px", fontWeight: 300, letterSpacing: "0.06em", color: "#F2EDE4", fontFamily: "'Cormorant Garamond', serif" },
        }, "Error"),
        React.createElement("p", {
          style: { margin: 0, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.14em", color: "#7A7570", lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" },
        }, text)
      )
    )
  )
}


export const confirmAlert = (
  text: string,
  buttonText: string,
  callback: () => void
) => {
  Swal.fire({
    title: 'Are you sure?',
    text: text,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: buttonText,
    cancelButtonText: 'Cancel',
    buttonsStyling: false,

    didOpen: () => {
      const popup = Swal.getPopup();
      const confirmBtn = Swal.getConfirmButton();
      const cancelBtn = Swal.getCancelButton();

      if (popup) {
        popup.style.borderRadius = '0px';
        popup.style.border = '1px solid #242424';
        popup.style.backgroundColor = '#1A1A1A';
        popup.style.padding = '32px';
        popup.style.display = 'flex';
        popup.style.flexDirection = 'column';
        popup.style.alignItems = 'center';
        popup.style.boxShadow = '0 0 60px rgba(201,168,76,0.08)';

        // Style the title
        const title = popup.querySelector('.swal2-title') as HTMLElement;
        if (title) {
          title.style.color = '#F2EDE4';
          title.style.fontFamily = "'Cormorant Garamond', serif";
          title.style.fontWeight = '300';
          title.style.fontSize = '1.75rem';
          title.style.letterSpacing = '-0.02em';
        }

        // Style the content text
        const content = popup.querySelector('.swal2-html-container') as HTMLElement;
        if (content) {
          content.style.color = '#7A7570';
          content.style.fontSize = '0.875rem';
          content.style.fontFamily = 'inherit';
        }

        // Style the warning icon
        const icon = popup.querySelector('.swal2-icon') as HTMLElement;
        if (icon) {
          icon.style.borderColor = '#C9A84C';
          icon.style.color = '#C9A84C';
        }
      }

      if (confirmBtn && cancelBtn) {
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.gap = '12px';
        wrapper.style.marginTop = '20px';

        confirmBtn.parentNode?.insertBefore(wrapper, confirmBtn);
        wrapper.appendChild(confirmBtn);
        wrapper.appendChild(cancelBtn);
      }

      const baseStyle: Partial<CSSStyleDeclaration> = {
        padding: '8px 20px',
        borderRadius: '0px',
        cursor: 'pointer',
        fontWeight: '400',
        fontSize: '10px',
        letterSpacing: '0.2em',
        textTransform: 'uppercase',
        transition: 'all 0.3s ease',
        fontFamily: 'inherit',
      };

      if (confirmBtn) {
        Object.assign(confirmBtn.style, baseStyle);
        confirmBtn.style.background = '#C9A84C';
        confirmBtn.style.color = '#080808';
        confirmBtn.style.border = '1px solid #C9A84C';
      }

      if (cancelBtn) {
        Object.assign(cancelBtn.style, baseStyle);
        cancelBtn.style.background = 'transparent';
        cancelBtn.style.color = '#7A7570';
        cancelBtn.style.border = '1px solid #242424';
      }

      if (confirmBtn) {
        confirmBtn.onmouseenter = () => {
          confirmBtn.style.background = '#E8C97A';
          confirmBtn.style.borderColor = '#E8C97A';
        };
        confirmBtn.onmouseleave = () => {
          confirmBtn.style.background = '#C9A84C';
          confirmBtn.style.borderColor = '#C9A84C';
        };
      }

      if (cancelBtn) {
        cancelBtn.onmouseenter = () => {
          cancelBtn.style.borderColor = 'rgba(201,168,76,0.25)';
          cancelBtn.style.color = '#F2EDE4';
        };
        cancelBtn.onmouseleave = () => {
          cancelBtn.style.borderColor = '#242424';
          cancelBtn.style.color = '#7A7570';
        };
      }
    },
  }).then((result) => {
    if (result.isConfirmed) {
      callback();
    }
  });
};


