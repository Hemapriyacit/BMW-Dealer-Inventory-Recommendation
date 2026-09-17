import { useEffect, useState } from "react";
import Select from "react-select";
import "./App.css";


function App() {
  // ============================================================
  // DEALERS AND MODELS
  // ============================================================

  const [dealers, setDealers] = useState([]);
  const [models, setModels] = useState([]);

  const [dealer, setDealer] = useState("");
  const [model, setModel] = useState("");


  // ============================================================
  // APPLICATION STATE
  // ============================================================

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [error, setError] = useState("");


  // ============================================================
  // LOAD DEALERS AND MODELS FROM FASTAPI
  // ============================================================

  useEffect(() => {
    const loadOptions = async () => {
      try {
        setOptionsLoading(true);
        setError("");

        const response = await fetch(
          "http://127.0.0.1:8000/options"
        );

        if (!response.ok) {
          throw new Error(
            "Unable to load dealer and BMW model options."
          );
        }

        const data = await response.json();

        setDealers(data.dealers || []);
        setModels(data.models || []);

        // Select first dealer by default
        if (data.dealers && data.dealers.length > 0) {
          setDealer(data.dealers[0]);
        }

        // Select first model by default
        if (data.models && data.models.length > 0) {
          setModel(data.models[0]);
        }

      } catch (err) {
        console.error("Options loading error:", err);

        setError(
          "Unable to load dealers and BMW models. " +
          "Please make sure the FastAPI backend is running on port 8000."
        );

      } finally {
        setOptionsLoading(false);
      }
    };

    loadOptions();
  }, []);


  // ============================================================
  // GET INVENTORY RECOMMENDATION
  // ============================================================

  const getRecommendation = async () => {

    if (!dealer || !model) {
      setError("Please select a dealer and BMW model.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {

      const response = await fetch(
        "http://127.0.0.1:8000/recommend",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            dealer_id: dealer,
            model: model,
          }),
        }
      );


      if (!response.ok) {

        let errorMessage = "Unable to get recommendation.";

        try {
          const errorData = await response.json();

          if (errorData.detail) {
            errorMessage = errorData.detail;
          }

        } catch {
          // Ignore JSON parsing error
        }

        throw new Error(errorMessage);
      }


      const data = await response.json();

      setResult(data);

    } catch (err) {

      console.error("Recommendation error:", err);

      setError(err.message);

    } finally {

      setLoading(false);

    }
  };


  // ============================================================
  // REACT-SELECT OPTIONS
  // ============================================================

  const dealerOptions = dealers.map((dealerId) => ({
    value: dealerId,
    label: dealerId,
  }));


  const modelOptions = models.map((modelName) => ({
    value: modelName,
    label: modelName,
  }));


  // ============================================================
  // CURRENT SELECTED VALUES
  // ============================================================

  const selectedDealer =
    dealerOptions.find(
      (option) => option.value === dealer
    ) || null;


  const selectedModel =
    modelOptions.find(
      (option) => option.value === model
    ) || null;


  // ============================================================
  // REACT SELECT CUSTOM STYLES
  // ============================================================

  const selectStyles = {

    control: (base, state) => ({
      ...base,

      minHeight: "52px",

      borderRadius: "10px",

      borderColor: state.isFocused
        ? "#1c69d4"
        : "#d8dde5",

      boxShadow: state.isFocused
        ? "0 0 0 2px rgba(28, 105, 212, 0.12)"
        : "none",

      "&:hover": {
        borderColor: "#1c69d4",
      },

      fontSize: "15px",

      cursor: "text",

      backgroundColor: "#ffffff",
    }),


    menu: (base) => ({
      ...base,

      zIndex: 100,

      borderRadius: "10px",

      overflow: "hidden",
    }),


    option: (base, state) => ({
      ...base,

      padding: "12px 14px",

      fontSize: "14px",

      cursor: "pointer",

      backgroundColor: state.isSelected
        ? "#1c69d4"
        : state.isFocused
          ? "#eef4fb"
          : "#ffffff",

      color: state.isSelected
        ? "#ffffff"
        : "#1f2937",
    }),


    placeholder: (base) => ({
      ...base,

      color: "#8a94a6",
    }),


    singleValue: (base) => ({
      ...base,

      color: "#1f2937",

      fontWeight: "500",
    }),
  };


  // ============================================================
  // APPLICATION UI
  // ============================================================

  return (
    <div className="app">


      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <aside className="sidebar">

        <div className="sidebar-brand">

          <div className="bmw-logo">
            <span>BMW</span>
          </div>

          <div className="brand-name">
            BMW
          </div>

        </div>


        <nav className="navigation">

          <div className="nav-item active">
            <span className="nav-icon">⌂</span>
            <span>Home</span>
          </div>


          <div className="nav-item">
            <span className="nav-icon">▥</span>
            <span>Inventory Recommendation</span>
          </div>


          <div className="nav-item">
            <span className="nav-icon">ⓘ</span>
            <span>About</span>
          </div>


          <div className="nav-item">
            <span className="nav-icon">?</span>
            <span>Help</span>
          </div>

        </nav>


        <div className="sidebar-footer">

          <div className="footer-line"></div>

          <span>
            Sheer Driving Pleasure
          </span>

        </div>

      </aside>



      {/* ======================================================
          MAIN CONTENT
      ====================================================== */}

      <main className="main-content">


        {/* ====================================================
            TOP BAR
        ==================================================== */}

        <header className="topbar">

          <div className="topbar-title">
            Dealer Analytics
          </div>


          <div className="topbar-brand">

            <div className="mini-bmw-logo">
              BMW
            </div>

            <span>
              BMW
            </span>

          </div>

        </header>



        {/* ====================================================
            HERO
        ==================================================== */}

        <section className="hero">

          <div className="hero-content">

            <div className="hero-label">
              BMW
            </div>


            <h1>
              Dealer Inventory
              <br />
              Recommendation
            </h1>


            <p>
              Predict demand and recommend inventory for each dealer
              and BMW model using machine learning.
            </p>

          </div>



          {/* Decorative vehicle */}

          <div className="hero-car">

            <div className="road"></div>


            <div className="car">

              <div className="car-roof"></div>


              <div className="car-body">

                <div className="car-window"></div>

                <div className="car-window back"></div>


                <div className="car-grille">

                  <span></span>
                  <span></span>

                </div>


                <div className="headlight left"></div>

                <div className="headlight right"></div>


                <div className="wheel left-wheel"></div>

                <div className="wheel right-wheel"></div>

              </div>

            </div>

          </div>

        </section>



        {/* ====================================================
            CONTENT
        ==================================================== */}

        <div className="content-wrapper">


          {/* ==================================================
              RECOMMENDATION CARD
          ================================================== */}

          <section className="recommendation-card">


            <div className="card-heading">

              <div className="heading-icon">
                ⚙
              </div>


              <div>

                <h2>
                  Generate Inventory Recommendation
                </h2>


                <p>
                  Select a dealer and BMW model to get an inventory
                  recommendation.
                </p>

              </div>

            </div>



            {/* =================================================
                SELECTORS
            ================================================= */}

            <div className="form-row">


              {/* DEALER */}

              <div className="form-group">

                <label>
                  Dealer
                </label>


                <div className="select-wrapper searchable-select">

                  <span className="select-icon">
                    ▣
                  </span>


                  <Select
                    options={dealerOptions}
                    value={selectedDealer}

                    onChange={(selected) => {

                      setDealer(
                        selected
                          ? selected.value
                          : ""
                      );

                      setResult(null);
                      setError("");

                    }}

                    placeholder={
                      optionsLoading
                        ? "Loading dealers..."
                        : "Search dealer..."
                    }

                    isSearchable
                    isClearable

                    isDisabled={
                      optionsLoading ||
                      loading
                    }

                    styles={selectStyles}

                    noOptionsMessage={() =>
                      "No dealer found"
                    }
                  />

                </div>


                {!optionsLoading && (
                  <small className="selector-hint">
                    {dealers.length} dealers available ·
                    Type to search
                  </small>
                )}

              </div>



              {/* BMW MODEL */}

              <div className="form-group">

                <label>
                  BMW Model
                </label>


                <div className="select-wrapper searchable-select">

                  <span className="select-icon">
                    ▱
                  </span>


                  <Select
                    options={modelOptions}
                    value={selectedModel}

                    onChange={(selected) => {

                      setModel(
                        selected
                          ? selected.value
                          : ""
                      );

                      setResult(null);
                      setError("");

                    }}

                    placeholder={
                      optionsLoading
                        ? "Loading models..."
                        : "Search BMW model..."
                    }

                    isSearchable
                    isClearable

                    isDisabled={
                      optionsLoading ||
                      loading
                    }

                    styles={selectStyles}

                    noOptionsMessage={() =>
                      "No BMW model found"
                    }
                  />

                </div>


                {!optionsLoading && (
                  <small className="selector-hint">
                    {models.length} BMW models available ·
                    Type to search
                  </small>
                )}

              </div>



              {/* GENERATE BUTTON */}

              <button
                className="recommend-button"

                onClick={getRecommendation}

                disabled={
                  loading ||
                  optionsLoading ||
                  !dealer ||
                  !model
                }
              >

                <span>
                  ✦
                </span>


                {optionsLoading
                  ? "Loading Options..."
                  : loading
                    ? "Generating..."
                    : "Generate Recommendation"}

              </button>

            </div>



            {/* =================================================
                INFO BANNER
            ================================================= */}

            <div className="smart-inventory">

              <div className="smart-icon">
                🚘
              </div>


              <div>

                <h3>
                  Smart Inventory. Better Decisions.
                </h3>


                <p>
                  Get data-driven recommendations to optimize
                  inventory, meet customer demand and improve
                  sales performance.
                </p>

              </div>

            </div>

          </section>



          {/* ==================================================
              WHY THIS MATTERS
          ================================================== */}

          <section className="why-card">

            <h2>
              Why This Matters
            </h2>


            <div className="benefit">

              <div className="benefit-icon">
                ↗
              </div>


              <div>

                <h3>
                  Meet Demand
                </h3>

                <p>
                  Ensure the right models are available at the right time.
                </p>

              </div>

            </div>



            <div className="benefit">

              <div className="benefit-icon">
                ◉
              </div>


              <div>

                <h3>
                  Optimize Inventory
                </h3>

                <p>
                  Reduce holding costs and minimize stockouts.
                </p>

              </div>

            </div>



            <div className="benefit">

              <div className="benefit-icon">
                ◎
              </div>


              <div>

                <h3>
                  Increase Sales
                </h3>

                <p>
                  Improve customer satisfaction and dealer performance.
                </p>

              </div>

            </div>



            <div className="benefit">

              <div className="benefit-icon">
                ♢
              </div>


              <div>

                <h3>
                  Data-Driven
                </h3>

                <p>
                  Powered by machine learning and real-world data.
                </p>

              </div>

            </div>

          </section>

        </div>



        {/* ====================================================
            ERROR MESSAGE
        ==================================================== */}

        {error && (

          <div className="error-box">

            <strong>
              Unable to process request
            </strong>


            <p>
              {error}
            </p>


            <small>
              Make sure the FastAPI backend is running on port 8000.
            </small>

          </div>

        )}



        {/* ====================================================
            RESULT
        ==================================================== */}

        {result && (

          <section className="results-section">


            <div className="results-title">

              <div>

                <span>
                  RECOMMENDATION RESULT
                </span>


                <h2>
                  {result.Dealer} · {result.Model}
                </h2>

              </div>


              <div className="trend-badge">
                {result["Sales Trend"]}
              </div>

            </div>



            {/* =================================================
                KPI CARDS
            ================================================= */}

            <div className="metric-grid">


              <div className="metric-card">

                <span>
                  Predicted Demand
                </span>


                <strong>
                  {Number(
                    result["Predicted Next Month Demand"]
                  ).toFixed(2)}
                </strong>


                <small>
                  Next month
                </small>

              </div>



              <div className="metric-card">

                <span>
                  Current Inventory
                </span>


                <strong>
                  {Number(
                    result["Current Inventory"]
                  ).toFixed(0)}
                </strong>


                <small>
                  Vehicles
                </small>

              </div>



              <div className="metric-card">

                <span>
                  Target Inventory
                </span>


                <strong>
                  {Number(
                    result["Target Inventory"]
                  ).toFixed(2)}
                </strong>


                <small>
                  Vehicles
                </small>

              </div>



              <div className="metric-card recommendation">

                <span>
                  Recommended Quantity
                </span>


                <strong>
                  {result["Recommended Quantity"]}
                </strong>


                <small>
                  Vehicles to stock
                </small>

              </div>

            </div>



            {/* =================================================
                RESULT BOTTOM
            ================================================= */}

            <div className="result-bottom">


              {/* INVENTORY POSITION */}

              <div className="inventory-position">

                <h3>
                  Inventory Position
                </h3>


                <div className="inventory-row">

                  <span>
                    Current Inventory
                  </span>


                  <strong>
                    {result["Current Inventory"]}
                  </strong>

                </div>


                <div className="progress">

                  <div
                    className="progress-current"

                    style={{
                      width: `${Math.min(
                        (
                          result["Current Inventory"] /
                          Math.max(
                            result["Target Inventory"],
                            1
                          )
                        ) * 100,
                        100
                      )}%`
                    }}

                  ></div>

                </div>



                <div className="inventory-row">

                  <span>
                    Target Inventory
                  </span>


                  <strong>
                    {Number(
                      result["Target Inventory"]
                    ).toFixed(2)}
                  </strong>

                </div>


                <div className="progress">

                  <div className="progress-target"></div>

                </div>



                <div className="days-inventory">

                  <span>
                    Days of Inventory
                  </span>


                  <strong>
                    {Number(
                      result["Days of Inventory"]
                    ).toFixed(2)}{" "}
                    days
                  </strong>

                </div>

              </div>



              {/* BUSINESS REASON */}

              <div className="business-reason">

                <span>
                  BUSINESS REASON
                </span>


                <h3>
                  Why this recommendation?
                </h3>


                <p>
                  {result.Reason}
                </p>

              </div>

            </div>

          </section>

        )}



        {/* ====================================================
            FOOTER
        ==================================================== */}

        <footer className="page-footer">

          <span>
            BMW Dealer Inventory Recommendation
          </span>


          <span className="footer-divider">
            |
          </span>


          <span>
            Machine Learning Project
          </span>


          <div className="footer-right">

            <strong>
              BMW
            </strong>

            <span>
              |
            </span>

            <span>
              Sheer Driving Pleasure
            </span>

          </div>

        </footer>


      </main>

    </div>
  );
}


export default App;