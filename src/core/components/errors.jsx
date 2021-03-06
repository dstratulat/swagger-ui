import React, { PropTypes } from "react"
import Im, { List } from "immutable"
import Collapse from "react-collapse"
import sortBy from "lodash/sortBy"

export default class Errors extends React.Component {

  static propTypes = {
    jumpToLine: PropTypes.func,
    errSelectors: PropTypes.object.isRequired,
    layoutSelectors: PropTypes.object.isRequired,
    layoutActions: PropTypes.object.isRequired
  }

  render() {
    let { jumpToLine, errSelectors, layoutSelectors, layoutActions } = this.props

    let errors = errSelectors.allErrors()

    // all thrown errors, plus error-level everything else
    let allErrorsToDisplay = errors.filter(err => err.get("type") === "thrown" ? true :err.get("level") === "error")

    if(!allErrorsToDisplay || allErrorsToDisplay.count() < 1) {
      return null
    }

    let isVisible = layoutSelectors.isShown(["errorPane"], true)
    let toggleVisibility = () => layoutActions.show(["errorPane"], !isVisible)

    let sortedJSErrors = allErrorsToDisplay.sortBy(err => err.get("line"))

    return (
      <pre className="errors-wrapper">
        <hgroup className="error">
          <h4 className="errors__title">Errors</h4>
          <button className="btn errors__clear-btn" onClick={ toggleVisibility }>{ isVisible ? "Hide" : "Show" }</button>
        </hgroup>
        <Collapse isOpened={ isVisible } animated >
          <div className="errors">
            { sortedJSErrors.map((err, i) => {
              if(err.get("type") === "thrown") {
                return <ThrownErrorItem key={ i } error={ err.get("error") || err } jumpToLine={jumpToLine} />
              }
              if(err.get("type") === "spec") {
                return <SpecErrorItem key={ i } error={ err } jumpToLine={jumpToLine} />
              }
            }) }
          </div>
        </Collapse>
      </pre>
      )
    }
}

const ThrownErrorItem = ( { error, jumpToLine } ) => {
  if(!error) {
    return null
  }
  let errorLine = error.get("line")

  return (
    <div className="error-wrapper">
      { !error ? null :
        <div>
          <h4>{ (error.get("source") && error.get("level")) ?
            toTitleCase(error.get("source")) + " " + error.get("level") : "" }
          { error.get("path") ? <small> at {error.get("path")}</small>: null }</h4>
          <span style={{ whiteSpace: "pre-line", "maxWidth": "100%" }}>
            { error.get("message") }
          </span>
          <div>
            { errorLine ? <a onClick={jumpToLine.bind(null, errorLine)}>Jump to line { errorLine }</a> : null }
          </div>
        </div>
      }
    </div>
    )
  }

const SpecErrorItem = ( { error, jumpToLine } ) => {
  return (
    <div className="error-wrapper">
      { !error ? null :
        <div>
          <h4>{ toTitleCase(error.get("source")) + " " + error.get("level") }{ error.get("path") ? <small> at {List.isList(error.get("path")) ? error.get("path").join(".") : error.get("path")}</small>: null }</h4>
          <span style={{ whiteSpace: "pre-line"}}>{ error.get("message") }</span>
          <div>
            { jumpToLine ? (
              <a onClick={jumpToLine.bind(null, error.get("line"))}>Jump to line { error.get("line") }</a>
            ) : null }
          </div>
        </div>
      }
    </div>
    )
  }

function toTitleCase(str) {
  return str
    .split(" ")
    .map(substr => substr[0].toUpperCase() + substr.slice(1))
    .join(" ")
}

ThrownErrorItem.propTypes = {
  error: PropTypes.object.isRequired,
  jumpToLine: PropTypes.func
}

SpecErrorItem.propTypes = {
  error: PropTypes.object.isRequired,
  jumpToLine: PropTypes.func
}
