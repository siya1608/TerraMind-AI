import io
import csv
from datetime import datetime
from typing import List

def generate_pdf_report(user_name: str, calculations: list, predictions: list) -> bytes:
    """
    Generates a styled PDF report using reportlab.
    Falls back to a plain-text PDF if reportlab is unavailable.
    """
    try:
        from reportlab.lib.pagesizes import letter, A4
        from reportlab.lib import colors
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import inch
        from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
        from reportlab.lib.enums import TA_CENTER, TA_LEFT

        buffer = io.BytesIO()
        doc = SimpleDocTemplate(buffer, pagesize=A4,
                                rightMargin=40, leftMargin=40,
                                topMargin=50, bottomMargin=40)

        styles = getSampleStyleSheet()
        GREEN = colors.HexColor("#79ff0f")
        DARK = colors.HexColor("#131313")
        SLATE = colors.HexColor("#2a2a2a")

        title_style = ParagraphStyle("Title", parent=styles["Title"],
                                     textColor=GREEN, fontSize=26,
                                     spaceAfter=6, alignment=TA_CENTER)
        h2_style = ParagraphStyle("H2", parent=styles["Heading2"],
                                  textColor=GREEN, fontSize=14, spaceBefore=16, spaceAfter=6)
        body_style = ParagraphStyle("Body", parent=styles["Normal"],
                                    textColor=colors.HexColor("#e5e2e1"), fontSize=10, leading=16)

        story = []

        # Title block
        story.append(Paragraph("TerraMind AI", title_style))
        story.append(Paragraph("Personal Carbon Intelligence Report", styles["Heading3"]))
        story.append(Paragraph(f"Generated for: <b>{user_name}</b>  |  {datetime.utcnow().strftime('%B %d, %Y UTC')}", body_style))
        story.append(HRFlowable(width="100%", thickness=1, color=GREEN, spaceAfter=12))

        # Summary section
        if calculations:
            latest = calculations[0]
            story.append(Paragraph("📊 Carbon Footprint Summary", h2_style))
            summary_data = [
                ["Metric", "Value"],
                ["Total CO2e (monthly)", f"{latest.total_co2:.3f} tons"],
                ["Annual Projection",   f"{latest.annual_carbon_footprint:.2f} tons"],
                ["Sustainability Score",f"{latest.sustainability_score:.1f}%"],
                ["Impact Rating",       latest.environmental_impact_rating],
                ["Transport Emissions", f"{latest.transport_emissions:.3f} tons"],
                ["Energy Emissions",    f"{latest.energy_emissions:.3f} tons"],
                ["Food Emissions",      f"{latest.food_emissions:.3f} tons"],
                ["Shopping Emissions",  f"{latest.shopping_emissions:.3f} tons"],
                ["Waste Emissions",     f"{latest.waste_emissions:.3f} tons"],
            ]
            t = Table(summary_data, colWidths=[3.2 * inch, 3.0 * inch])
            t.setStyle(TableStyle([
                ("BACKGROUND",   (0, 0), (-1, 0), SLATE),
                ("TEXTCOLOR",    (0, 0), (-1, 0), GREEN),
                ("FONTSIZE",     (0, 0), (-1, 0), 11),
                ("FONTNAME",     (0, 0), (-1, 0), "Helvetica-Bold"),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#1c1b1b"), colors.HexColor("#201f1f")]),
                ("TEXTCOLOR",    (0, 1), (-1, -1), colors.HexColor("#e5e2e1")),
                ("ALIGN",        (1, 0), (-1, -1), "CENTER"),
                ("GRID",         (0, 0), (-1, -1), 0.5, colors.HexColor("#3e4a35")),
                ("ROWPADDING",   (0, 0), (-1, -1), 8),
            ]))
            story.append(t)

        story.append(Spacer(1, 14))

        # Historical log
        if len(calculations) > 1:
            story.append(Paragraph("📅 Historical Footprint Log", h2_style))
            history_data = [["Date", "Total CO2 (tons)", "Score (%)", "Rating"]]
            for c in calculations[:10]:
                history_data.append([
                    c.timestamp.strftime("%Y-%m-%d"),
                    f"{c.total_co2:.3f}",
                    f"{c.sustainability_score:.1f}",
                    c.environmental_impact_rating
                ])
            ht = Table(history_data, colWidths=[2.0 * inch, 2.0 * inch, 2.0 * inch, 1.5 * inch])
            ht.setStyle(TableStyle([
                ("BACKGROUND",   (0, 0), (-1, 0), SLATE),
                ("TEXTCOLOR",    (0, 0), (-1, 0), GREEN),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#1c1b1b"), colors.HexColor("#201f1f")]),
                ("TEXTCOLOR",    (0, 1), (-1, -1), colors.HexColor("#e5e2e1")),
                ("ALIGN",        (1, 0), (-1, -1), "CENTER"),
                ("GRID",         (0, 0), (-1, -1), 0.5, colors.HexColor("#3e4a35")),
                ("FONTNAME",     (0, 0), (-1, 0), "Helvetica-Bold"),
                ("ROWPADDING",   (0, 0), (-1, -1), 7),
            ]))
            story.append(ht)
            story.append(Spacer(1, 14))

        # Predictions
        if predictions:
            story.append(Paragraph("🔮 6-Month AI Forecast", h2_style))
            pred_data = [["Target Month", "Predicted CO2 (tons)", "Predicted Score (%)"]]
            for p in predictions:
                pred_data.append([
                    str(p.target_date),
                    f"{p.predicted_emissions:.3f}",
                    f"{p.predicted_sustainability_score:.1f}"
                ])
            pt = Table(pred_data, colWidths=[2.5 * inch, 2.5 * inch, 2.5 * inch])
            pt.setStyle(TableStyle([
                ("BACKGROUND",   (0, 0), (-1, 0), SLATE),
                ("TEXTCOLOR",    (0, 0), (-1, 0), GREEN),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#1c1b1b"), colors.HexColor("#201f1f")]),
                ("TEXTCOLOR",    (0, 1), (-1, -1), colors.HexColor("#e5e2e1")),
                ("ALIGN",        (1, 0), (-1, -1), "CENTER"),
                ("GRID",         (0, 0), (-1, -1), 0.5, colors.HexColor("#3e4a35")),
                ("FONTNAME",     (0, 0), (-1, 0), "Helvetica-Bold"),
                ("ROWPADDING",   (0, 0), (-1, -1), 7),
            ]))
            story.append(pt)

        story.append(Spacer(1, 20))
        story.append(HRFlowable(width="100%", thickness=1, color=SLATE, spaceAfter=8))
        story.append(Paragraph("Generated by TerraMind AI AI Intelligence Platform • terramind_ai.ai", body_style))

        doc.build(story)
        return buffer.getvalue()

    except ImportError:
        # Plain text PDF fallback (minimal)
        content = f"""TerraMind AI Carbon Intelligence Report
====================================
User: {user_name}
Generated: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}

No reportlab installed. Please install: pip install reportlab
""".encode("utf-8")
        return content


def generate_csv_report(calculations: list, predictions: list) -> str:
    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow(["=== HISTORICAL CARBON FOOTPRINT ==="])
    writer.writerow(["Date", "Total CO2 (tons)", "Annual Projection (tons)",
                     "Sustainability Score (%)", "Rating",
                     "Transport", "Energy", "Food", "Shopping", "Waste", "Water"])
    for c in calculations:
        writer.writerow([
            c.timestamp.strftime("%Y-%m-%d %H:%M"),
            c.total_co2, c.annual_carbon_footprint,
            c.sustainability_score, c.environmental_impact_rating,
            c.transport_emissions, c.energy_emissions, c.food_emissions,
            c.shopping_emissions, c.waste_emissions, c.water_emissions
        ])

    writer.writerow([])
    writer.writerow(["=== 6-MONTH AI PREDICTIONS ==="])
    writer.writerow(["Target Date", "Predicted CO2 (tons)", "Predicted Score (%)", "Predicted Annual Impact (tons)"])
    for p in predictions:
        writer.writerow([p.target_date, p.predicted_emissions,
                         p.predicted_sustainability_score, p.predicted_annual_impact])

    return output.getvalue()
