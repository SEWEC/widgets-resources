import {
    createElement,
    Dispatch,
    forwardRef,
    Fragment,
    MutableRefObject,
    ReactElement,
    SetStateAction,
    useCallback,
    useMemo,
    useRef,
    useState
} from "react";
import DatePickerComponent from "react-datepicker";
import classNames from "classnames";
import { isDate, isValid } from "date-fns";
import { createPortal } from "react-dom";
import replaceAllInserter from "string.prototype.replaceall";

interface DatePickerProps {
    adjustable: boolean;
    dateFormat?: string;
    locale?: string;
    id?: string;
    placeholder?: string;
    screenReaderCalendarCaption?: string;
    screenReaderInputCaption?: string;
    setValue: Dispatch<SetStateAction<Date | null>>;
    value: Date | null;
    calendarStartDay?: number;
}

replaceAllInserter.shim();

export const DatePicker = forwardRef(
    (props: DatePickerProps, ref: MutableRefObject<DatePickerComponent> | null): ReactElement => {
        const [open, setOpen] = useState(false);
        const buttonRef = useRef<HTMLButtonElement>(null);
        const portalRef = useRef<HTMLDivElement>(null);
        const id = useMemo(() => `datepicker_` + Math.random(), []);
        const Portal = createPortal(
            <div ref={portalRef} id={id} className="date-filter-container" style={{ position: "fixed" }} />,
            document.body
        );

        const buttonClick = useCallback(() => {
            setOpen(open => !open);
            setTimeout(() => {
                (portalRef.current?.querySelector(".react-datepicker > button") as HTMLElement)?.focus();
            }, 10);
        }, []);

        const dateFormats = props.dateFormat ? [props.dateFormat] : undefined;
        // Check is date format only contains short versions of day and month
        if (!!props.dateFormat && /(?<![dm])([dm])(?!\1)/.test(props.dateFormat)) {
            // Replace with full patterns d -> dd, M -> MM
            dateFormats?.push(props.dateFormat.replaceAll(/(?<!d)d(?!d)|(?<!M)M(?!M)/g, m => m + m));
        }

        return (
            <Fragment>
                {Portal}
                <span className="sr-only" id={`${props.id}-label`}>
                    {props.screenReaderInputCaption}
                </span>
                <DatePickerComponent
                    adjustDateOnChange
                    allowSameDay={false}
                    ariaLabelledBy={`${props.id}-label`}
                    autoFocus={false}
                    className={classNames("form-control", { "filter-input": props.adjustable })}
                    dateFormat={dateFormats}
                    disabledKeyboardNavigation={false}
                    dropdownMode="select"
                    enableTabLoop
                    locale={props.locale}
                    calendarStartDay={props.calendarStartDay}
                    onChange={date => {
                        if (isDate(date) && isValid(date)) {
                            props.setValue(date as Date);
                        } else {
                            props.setValue(null);
                        }
                    }}
                    open={open}
                    onClickOutside={event => {
                        if (!buttonRef.current || buttonRef.current.contains(event.target as Node)) {
                            return;
                        }
                        setOpen(false);
                    }}
                    placeholderText={props.placeholder}
                    popperPlacement="bottom-end"
                    popperModifiers={[
                        {
                            name: "offset",
                            options: {
                                offset: [0, 0]
                            }
                        }
                    ]}
                    preventOpenOnFocus
                    ref={ref}
                    selected={props.value}
                    shouldCloseOnSelect={false}
                    showMonthDropdown
                    showPopperArrow={false}
                    showYearDropdown
                    strictParsing
                    useWeekdaysShort={false}
                    portalId={id}
                />
                <button
                    aria-controls={id}
                    aria-expanded={open}
                    aria-haspopup
                    aria-label={props.screenReaderCalendarCaption ?? "Show calendar"}
                    ref={buttonRef}
                    className="btn btn-default btn-calendar"
                    onClick={buttonClick}
                    onKeyDown={e => {
                        if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            e.stopPropagation();
                            buttonClick();
                        }
                    }}
                >
                    <span className="glyphicon glyphicon-calendar" />
                </button>
            </Fragment>
        );
    }
);
