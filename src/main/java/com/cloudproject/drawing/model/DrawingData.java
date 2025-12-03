package com.cloudproject.drawing.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DrawingData {

    private String type;  // "line", "circle", "rect", "pen", "eraser"

    private List<Double> coordinates;  // [x1, y1, x2, y2] or [x, y, radius] etc.

    private String color;  // "#000000" format

    private Integer strokeWidth;  // 1-50
}
