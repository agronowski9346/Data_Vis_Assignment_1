import React, { useEffect } from "react";
import logo from "./logo.svg";
import "./App.css";
import * as d3 from "d3";
import csv from "./Saving_Rates.csv";

function App() {
  useEffect(() => {
    let graph = async () => {
      let data = await d3.csv(csv);
      let spacing = 50;
      let svgHeight = 700;
      let svgWidth = 900;

      let countries = new Set();

      let grouped = d3.group(data, (d) => {
        if (!countries.has(d.LOCATION)) {
          countries.add(d.LOCATION);
        }
        return d.LOCATION;
      });
      countries = Array.from(countries);

      let scandianvianNordicCountries = [
        "DNK",
        "FIN",
        "NLD",
        "NOR",
        "SWE",
        "CHE",
      ];
      let westEuropeCountries = [
        "FRA",
        "DEU",
        "ITA",
        "LUX",
        "PRT",
        "ESP",
        "GBR",
      ];
      let easternEuropeCountries = [
        "HUN",
        "POL",
        "SVK",
        "EST",
        "RUS",
        "SVN",
        "LVA",
        "LTU",
      ];
      let asianCountries = ["JPN", "KOR", "CHN"];
      let northAmericanCountries = ["USA", "CAN"];
      let southAmericanCountries = ["MEX", "CHL", "CRI", "COL"];
      let oceaniaCountries = ["NZL"];

      //x-Axis is year
      let minYear = d3.min(data, (d) => {
        return parseInt(d.TIME);
      });
      let maxYear = d3.max(data, (d) => {
        return parseInt(d.TIME);
      });
      let xScale = d3
        .scaleLinear()
        .domain([minYear, maxYear])
        .range([spacing, svgWidth - spacing]);

      let maxRate = d3.max(data, (d) => {
        return parseFloat(d.Value);
      });
      let yScale = d3
        .scaleLinear()
        .domain([-20, maxRate])
        .range([svgHeight - spacing, spacing]);

      let xAxis = d3.axisBottom(xScale).ticks(20);
      let yAxis = d3.axisLeft(yScale).ticks(40);

      let svg = d3
        .select("div.App")
        .append("svg")
        .attr("height", svgHeight)
        .attr("width", svgWidth);

      svg
        .append("g")
        .attr("transform", "translate(0, " + (svgHeight - spacing) + ")")
        .call(xAxis);

      svg
        .append("text")
        .text("Year")
        .attr(
          "transform",
          "translate(" + svgWidth / 2 + ", " + (svgHeight - 10) + ")"
        )
        .style("color", "black");

      svg
        .append("text")
        .text("Percent of Income Saved")
        .attr(
          "transform",
          "translate(" + 20 + ", " + (svgHeight / 2 + 80) + ") rotate(-90 0 0)"
        )
        .style("color", "black");
      svg
        .append("g")
        .attr("transform", "translate(" + spacing + ", 0)")
        .call(yAxis);

      let line = d3
        .line()
        .x((d) => {
          return xScale(parseInt(d.TIME));
        })
        .y((d) => {
          return yScale(parseFloat(d.Value));
        });

      let onMouseOver = (event, d, i) => {
        console.log(event);
        console.log(d);
        console.log(i);
        d3.select("#tooltip")
          .classed("show", true)
          .style("top", event.clientY + 5 + "px")
          .style("left", event.clientX + 5 + "px")
          .html(
            d.TIME + " " + d.LOCATION + " " + Number(d.Value).toFixed(2) + "%"
          );
        d3.select("#tooltip").classed("hide", false);
      };

      let onMouseOut = (e) => {
        d3.select("#tooltip").classed("show", false);
        d3.select("#tooltip").classed("hide", true);
      };

      let ref = svg.selectAll("circle");

      let p = d3.select("div").append("p").attr("id", "tooltip");

      let generateLine = (countries, color) => {
        for (let i = 0; i < countries.length; i++) {
          //log("hi " + grouped.get(countries[i]));

          svg
            .append("path")
            .attr("fill", "none")
            .attr("stroke", color)
            .attr("stroke-width", 2)
            .attr("d", line(grouped.get(countries[i])));

          ref
            .data(grouped.get(countries[i]))
            .enter()
            .append("circle")
            .attr("r", 3)
            .attr("cx", (d) => {
              return xScale(parseInt(d.TIME));
            })
            .attr("cy", (d) => {
              return yScale(parseFloat(d.Value));
            })
            .attr("fill", color)
            .on("mouseover", (event, d, i) => {
              onMouseOver(event, d, i);
            })
            .on("mouseout", (e) => {
              onMouseOut(e);
            });
        }
      };
      generateLine(scandianvianNordicCountries, "blue");
      generateLine(westEuropeCountries, "black");
      generateLine(easternEuropeCountries, "red");
      generateLine(asianCountries, "green");
      generateLine(northAmericanCountries, "yellow");
      generateLine(southAmericanCountries, "orange");
      generateLine(oceaniaCountries, "brown");

      let legend = d3
        .select("div")
        .append("svg")
        .style("position", "absolute")
        .style("left", svgWidth + 50 + "px")
        .style("top", 400 + "px")
        .style("background-color", "white");

      let names = [
        "Scandinavia & Nordic Countries",
        "Western Europe",
        "Eastern Europe",
        "Asia",
        "North America",
        "South America",
        "Oceania",
      ];
      let rect = legend.selectAll("rect").data(names);

      let text = legend.selectAll("text").data(names);

      text
        .enter()
        .append("text")
        .text((d) => d)
        .attr("y", (d, i) => {
          return (i + 1) * 20 + 8;
        })
        .attr("x", 75)
        .style("font-size", 11);

      rect
        .enter()
        .append("rect")
        .attr("y", (d, i) => {
          return (i + 1) * 20;
        })
        .attr("x", 20)
        .attr("fill", (d, i) => {
          if (d === "Scandinavia & Nordic Countries") return "blue";
          else if (d === "Western Europe") return "black";
          else if (d === "Eastern Europe") return "red";
          else if (d === "Asia") return "green";
          else if (d === "North America") return "yellow";
          else if (d === "South America") return "orange";
          else if (d === "Oceania") return "grey";
        })
        .attr("height", 10)
        .attr("width", 50);
    };

    graph();
  });
  return (
    <div className="App">
      <p id="#info">
        By Alexander Gronowski, Data from
        https://data.oecd.org/hha/household-debt.htm
      </p>
    </div>
  );
}

export default App;
