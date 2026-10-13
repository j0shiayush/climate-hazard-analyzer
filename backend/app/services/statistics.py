import pymannkendall as mk
from scipy import stats
import pandas as pd

def calculate_trends(annual_stats: list) -> dict:
    """
    Applies OLS Regression and Mann-Kendall test to annual heatwave frequencies.
    """
    if len(annual_stats) < 3:
        return {"error": "Not enough data points for trend analysis"}

    df = pd.DataFrame(annual_stats)
    years = df["year"].values
    counts = df["heatwave_count"].values

    slope, intercept, r_value, p_value, std_err = stats.linregress(years, counts)
    
    mk_result = mk.original_test(counts)

    try:
        first_5_avg = df["heatwave_count"].head(5).mean()
        last_5_avg = df["heatwave_count"].tail(5).mean()
        pct_change = ((last_5_avg - first_5_avg) / first_5_avg * 100) if first_5_avg > 0 else 0
    except Exception:
        pct_change = 0

    return {
        "linear_regression": {
            "slope": round(slope, 4),
            "p_value": round(p_value, 4),
            "is_significant": bool(p_value < 0.05)
        },
        "mann_kendall": {
            "trend": str(mk_result.trend),
            "p_value": float(round(mk_result.p, 4)),
            "sens_slope": float(round(mk_result.slope, 4))
        },
        "insights": {
            "percentage_change": round(pct_change, 1),
            "summary_text": f"Heatwave frequency shows an {mk_result.trend} trend (p={round(mk_result.p, 4)}). "
                            f"Recent years average {round(pct_change, 1)}% change compared to the start of the period."
        }
    }