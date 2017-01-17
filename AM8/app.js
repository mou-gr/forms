/*global $ Alpaca */

var equals = function(i) {
    return function(j) {
        return j === i;
    }
}

var $alpaca = function(index, prefix, suffix) {
    return (prefix ? prefix : "") + '[data-alpaca-container-item-index="' + index + '"]' + (suffix ? suffix : "");
};
var getPlotData = function($div) {

    return $div.find('tbody tr').toArray().map(function(el) {
        return $(el).find('input').toArray().map(function(el) {
            return el.value;
        });
    });
};

var createGant = function(chartDiv, $dataDiv) {

    var d = getPlotData($dataDiv);

    if (d.length < 2) {
        return;
    }

    var series = [{
        data: d.map(function(el, i) {
            return [1 * el[3] + 1 * el[2], i, 1 * el[2]];
        }),
        color: '#123456'
    }];

    var options = {
        xaxis: {
            minTickSize: 1,
            min: 0
        },
        yaxis: {
            ticks: d.map(function(el, i) {
                return [i, el[0]];
            }),
        },
        series: {
            lines: {
                show: false
            },
            bars: {
                barWidth: 0.6,
                horizontal: true,
                show: true
            },
            stack: true
        }
    };
    return $.plot("#" + chartDiv, series, options);
};

/**
selects the td and tr elements of a given table
@param {string} arr - selector for the array (usually a class)
@param {number[]} rows - list of rows to be returned 0 indexed - empty array => all rows - negatives count from the end
@param {number[]} cols - list of columns to be returned 0 indexed - empty array => all columns
@returns {element[]} - list of all DOM elements that match the criteria
 */
var tableSelect = function(arr, rows, cols) {
    'use strict';
    var $arr = $(arr).find('table');
    var length = $arr.find('>tbody >tr').length;
    var colSelector, ret;

    var rowSelector = rows.reduce(function(acc, el, i) {
        el < 0 && (el = length + el);
        var selector = $alpaca(el);
        i != 0 && (selector = ',' + selector);
        return acc + selector;
    }, 'tr');
    if (cols === undefined) {
        ret = $arr.find(rowSelector);
    }
    else {
        colSelector = cols.reduce(function(acc, el, i) {
            var selector = $alpaca(el);
            i != 0 && (selector = ',' + selector);
            return acc + selector;
        }, 'td');
        ret = $arr.find(rowSelector).find(colSelector);
    }
    return ret;
};

//calculate options for arrays 5.3
//returns declared worckpackages
//if article28 = true returns only related with article28
// if false returns the rest
var getWorkPackages = function(article28) {
    'use strict'
    var $arr = $('[data-alpaca-field-id="4.1b"] tbody tr').toArray();
    var arrValues = $arr.map(function(el) {
        return {
            value: $(el).find('td[data-alpaca-container-item-index="0"] input').val(),
            option: $(el).find('td[data-alpaca-container-item-index="2"] :input').val(),
            text: $(el).find('td[data-alpaca-container-item-index="1"] input').val()
        }
    });

    var ret = [];

    if (article28) {
        ret = arrValues.filter(function(el) {
            return el.option == 3
        });
    }
    else {
        ret = arrValues.filter(function(el) {
            return el.option != 3
        });
    }
    return ret;
}

var updateSelect = function() {
    var createOptions = function(arr) {
        return arr.reduce(function(a, b) {
            return a + '<option value="' + b.value + '">' + b.text + '</option>';
        }, '');
    };

    var article25 = createOptions(getWorkPackages(false));
    var article28 = createOptions(getWorkPackages(true));

    $('.reference-article-25 select').each( function () {
        var value = $(this).val();
        $(this).empty().append($(article25));
        $(this).val(value);
    });
        
    $('.reference-article-28 select').each( function () {
        var value = $(this).val();
        $(this).empty().append($(article28));
        $(this).val(value);
    });
};

$(document).ready(function() {

    $('body').css('cursor', 'progress');

    Alpaca.views["bootstrap-edit"].callbacks["collapsible"] = function() {
        var $fieldEl = $(this.getFieldEl());
        var $legendEl = $fieldEl.find("legend").first();
        var $anchorEl = $("[data-toggle='collapse']", $legendEl);
        if ($anchorEl.length > 0) {
            var $containerEl = $(this.getContainerEl());
            var id = $containerEl.attr("id");
            if (!id) {
                id = Alpaca.generateId();
                $containerEl.attr("id", id);
            }
            $anchorEl.attr("aria-expanded", this.options.collapsed ? "false" : "true");
            $containerEl.addClass(this.options.collapsed ? "collapse" : "collapse in");
            if (!$anchorEl.attr("data-target")) {
                $anchorEl.attr("data-target", "#" + id);
            }
            $anchorEl.mouseover(function(e) {
                $(this).css("cursor", "pointer");
            })
        }
    };

    Alpaca.defaultToolbarSticky = true;

    $('#form1').alpaca({
        schemaSource: "./schema/compiledSchema.json",
        optionsSource: "./options.json",
        dataSource: "./data.json",
        postRender: function(control) {
            $('body').css('cursor', 'default');

            $('.array-with-help').find('.help-block').each(function() {
                this.parentNode.appendChild(this);
            });

            ['.array51', '.array25', '.array3', '.array28',
                '.array5311', '.array5312', '.array5313', '.array5314',
                '.array5315', '.array5316', '.array53161', '.array5317', '.array5318',
                '.array5319', '.array53110', '.array53111', '.array53112', '.array54',
                '.array55', '.array-total-sum'
            ].forEach(function(el) {
                tableSelect(el, [-1], []).find('input').attr('readonly', true);
                tableSelect(el, [-1], [1]).attr('colspan', 2).addClass('subtitle-sum');
                tableSelect(el, [-1], [0]).remove();
                tableSelect(el, [-1]).find('.reference-41b').closest('td').remove();
            });

            tableSelect('.array52', [1], [0]).attr('colspan', 2).addClass('subtitle');
            tableSelect('.array52', [1], []).find('input').attr('readonly', true);
            tableSelect('.array52', [1], [1]).remove();

            tableSelect('.array51', [0, 10], [1]).attr('colspan', 4).addClass('subtitle');
            tableSelect('.array51', [0, 10], [0, 2, 3]).remove();

            tableSelect('.array25', [0, 4, 7, 11, 16], [1]).attr('colspan', 4).addClass('subtitle');
            tableSelect('.array25', [0, 4, 7, 11, 16], [0, 2, 3]).remove();

            tableSelect('.array28', [0, 2, 5], [1]).attr('colspan', 4).addClass('subtitle');
            tableSelect('.array28', [0, 2, 5], [0, 2, 3]).remove();

            tableSelect('.array3', [0, 4, 7, 11, 16], [1]).attr('colspan', 4).addClass('subtitle');
            tableSelect('.array3', [0, 4, 7, 11, 16], [0, 2, 3]).remove();

            tableSelect('.array5311', [-1], [1]).attr('colspan', 5).addClass('subtitle-sum');
            tableSelect('.array5311', [-1], [2, 3, 4, 6]).remove();

            tableSelect('.array5312', [-1], [1]).attr('colspan', 4).addClass('subtitle-sum');
            tableSelect('.array5312', [-1], [2, 3]).remove();

            ['.array5313', '.array5314', '.array5315', '.array54'].forEach(function(el) {
                tableSelect(el, [-1], [1]).attr('colspan', 3).addClass('subtitle-sum');
                tableSelect(el, [-1], [2]).remove();
            });

            tableSelect('.array54', [], [5]).find('input').attr('readonly', true);
            //add dynamically readonly to new percentage columns
            $('body').on('DOMNodeInserted', '.array54', function() {
                //alert("");
                tableSelect($(this), [], [5]).find('input').attr('readonly', true);
            });
            tableSelect('.array55', [], [3]).find('input').attr('readonly', true);


            var computeSum = function(el, col, per, offset) {
                var sum = 0 - offset;
                var arr = $(el).find('tr:not(:last-child) ' + col + ' input');
                $.each(arr, function() {
                    var num = 1 * this.value;
                    !isNaN(num) && (sum += num);
                    (per == true) && ($(el).find('.per-col').length > 0) && $.each(arr, function() {
                        num = 1 * this.value;
                        if (!isNaN(num)) {
                            $(this).closest("tr").find('.per-col input').val((100 * num / sum).toFixed(2));
                        }
                        $(el).find('tr:last-child .per-col input').val("100");
                    });
                    $(el).find('tr:last-child ' + col + ' input').val(sum);
                });
            };

            $('.auto-sum').each(function(i, el) { // Default sum, per function 

                $(el).on('change', '.sum-col > input', function() {
                    computeSum(el, '.sum-col', true, 0);
                });
                $(el).on('mouseup', '.table-bordered>tbody>tr>td.actionbar button[data-alpaca-array-actionbar-action="remove"]', function(el1) {
                    var temp = $(this).closest('tr').find('.sum-col input').val();
                    computeSum(el, '.sum-col', true, temp);
                });

                ['.sum-col-extra', '.sum-col-extra-2'].forEach(function(col) {
                    if ($(el).find(col).length > 0) {
                        $(el).on('change', col + ' > input', function() {
                            computeSum(el, col, false, 0);
                        });
                        $(el).on('mouseup', '.table-bordered>tbody>tr>td.actionbar button[data-alpaca-array-actionbar-action="remove"]', function(el1) {
                            var temp = $(this).closest('tr').find(col + ' input').val();
                            computeSum(el, col, false, temp);
                        });
                    }
                });
            });

            $('.gant-data').append('<div id="gant-chart"></div>');
            var plot = createGant('gant-chart', $('.gant-data'));

            $('.gant-data').on('change', 'input', function() {
                plot = createGant('gant-chart', $('.gant-data'));
            });

            $('.kad-table').on('change', $alpaca(1, 'td', ' :input'), function() {
                $(this).closest('tr').find($alpaca(2, 'td', ' input')).val($(this).val());
            });

            //tab3 
            [0, 1, 2].map(function(row) {
                [1, 3].map(function(col) {
                    $('[data-alpaca-field-id="sourceFin"] tbody tr[data-alpaca-container-item-index=' + row + '] td[data-alpaca-container-item-index=' + col + '] input')
                        .on('change', function(el) {
                            $('[data-alpaca-field-id="targetFin"] tbody tr[data-alpaca-container-item-index=' + (row + 2) + '] td[data-alpaca-container-item-index=' + (col == 3 ? 2 : 1) + '] input')
                                .val(this.value);
                        });

                    $('[data-alpaca-field-id="targetFin"] tbody tr[data-alpaca-container-item-index=' + (row + 2) + '] td[data-alpaca-container-item-index=' + (col == 3 ? 2 : 1) + '] input')
                        .prop('disabled', true);
                });
            });

            //tab4 

            //tab5

            updateSelect();
            //refresh 5.3 on change of 4.1b and when adding rows
            $('[data-alpaca-field-id="4.1b"]').on('change', updateSelect);
            $('[data-alpaca-field-id="5.3"]').on('mousedown', '[data-alpaca-array-actionbar-action="add"]', function() {
                setTimeout(updateSelect, 400);
            });

            //automatic sum of tables
            /**
            @param {table} $table - jquery object of the table from which the data will be red
            @param {number} col - column that will be used for the sums
            @param {function} condition - function to filter columns
            @returns {function} - function that returns the sum
             */
            var tableSumIf = function($table, col, condition) {
                if (typeof condition !== "function") {
                    condition = function() {
                        return true;
                    }
                };
                var sum = 0;
                var $rows = $table.find('tbody tr:not(:last-child)');

                $.each($rows, function(i, el) {
                    sum += condition($(el)) ? 1 * $(el).find($alpaca(col, 'td', ' input')).val() : 0;
                });

                return sum || 0;
            };

            var sel = function(row, col) {
                return 'tbody tr[data-alpaca-container-item-index=' + row + '] td[data-alpaca-container-item-index=' + col + '] input';
            };

            //generate a function that checks all requirements
            // requirements is an object {col: value}
            // the function should return true if all columns have the corresponding values
            var generateCondition = function(requirement) {
                return function($row) {
                    if (!requirement) {
                        return true;
                    }

                    var ret = true;
                    $.each(requirement, function(i, el) {
                        // ret = (ret && $row.find($alpaca(i, 'td', ' :input')).val() === el);
                        ret = (ret && el($row.find($alpaca(i, 'td', ' :input')).val()))
                    });
                    return ret;
                };
            };

            var getArticle = function(id) {
                var value = $('[data-alpaca-field-id="4.1b"]').find(sel(id, 2)).find('select').val();

                return [0, 25, 25, 28, 3][value];
            };

            var is25 = function(id) {
                var package = getWorkPackages(false);
                var valid = package.filter(function(el) {
                    return el.value == id && (el.option == 1 || el.option == 2);
                });

                return valid.length > 0;
            }
            var is28 = function(id) {
                var package = getWorkPackages(true);
                var valid = package.filter(function(el) {
                    return el.value == id;
                });

                return valid.length > 0;
            }
            var is3 = function(id) {
                var package = getWorkPackages(false);
                var valid = package.filter(function(el) {
                    return el.value == id && el.option == 4;
                });

                return valid.length > 0;
            }

            $('[data-alpaca-field-id="5.3"]').on('change', function() {

                var arr51 = $('[data-alpaca-field-id="5.1"]');
                var arr5121 = $('[data-alpaca-field-id="5.1.2.1"]');
                var arr5122 = $('[data-alpaca-field-id="5.1.2.2"]');
                var arr5123 = $('[data-alpaca-field-id="5.1.2.3"]');


                arr51.find(sel(1, 2)).val(tableSumIf($('[data-alpaca-field-id="5.3.1"]'), 5, function($row) {
                    var employ = $row.find($alpaca(3, 'td', ' :input')).val();
                    var article = $row.find($alpaca(7, 'td', ' :input')).val();
                    return employ !== 'Δελτίο Παροχής' && is25(article);
                }));

                //[targetRow, sourceArray, sourceColumn, targetArray, condition]
                [
                    [2, '5.3.1', 5, arr51, {
                        3: equals('Δελτίο Παροχής'),
                        7: is25
                    }],
                    [3, '5.3.2', 6, arr51, {
                        2: equals('Εξοπλισμός'),
                        7: is25
                    }],
                    [4, '5.3.2', 6, arr51, {
                        2: equals('Κτίριο'),
                        7: is25
                    }],
                    [5, '5.3.3', 3, arr51, {
                        4: is25
                    }],
                    [6, '5.3.5', 3, arr51, {
                        4: is25
                    }],
                    [7, '5.3.6', 2, arr51, {
                        3: is25
                    }],
                    [8, '5.3.8', 2, arr51, {
                        3: is25
                    }],
                    [9, '5.3.4', 3, arr51, {
                        4: is25
                    }],
                    [11, '5.3.11', 2, arr51, {
                        4: is28
                    }],
                    [12, '5.3.10', 2, arr51, {
                        3: is28
                    }],
                    [13, '5.3.12', 2, arr51, {
                        3: is28
                    }],

                    [1, '5.3.1', 5, arr5121, {
                        3: equals('Υφιστάμενο Προσωπικό'),
                        7: is25
                    }],
                    [2, '5.3.1', 5, arr5121, {
                        3: equals('Νέο Προσωπικό'),
                        7: is25
                    }],
                    [3, '5.3.1', 5, arr5121, {
                        3: equals('Δελτίο Παροχής'),
                        7: is25
                    }],
                    [5, '5.3.2', 6, arr5121, {
                        2: equals('Εξοπλισμός'),
                        7: is25
                    }],
                    [6, '5.3.2', 6, arr5121, {
                        2: equals('Κτίριο'),
                        7: is25
                    }],
                    [8, '5.3.3', 3, arr5121, {
                        4: is25
                    }],
                    [9, '5.3.5', 3, arr5121, {
                        4: is25
                    }],
                    [10, '5.3.9', 2, arr5121, {
                        3: is25
                    }],
                    [12, '5.3.7', 2, arr5121, {
                        3: is25
                    }],
                    [13, '5.3.8', 2, arr5121, {
                        3: is25
                    }],
                    [14, '5.3.6', 2, arr5121, {
                        3: is25
                    }],
                    [15, '5.3.6.1', 2, arr5121, {
                        3: is25
                    }],
                    [17, '5.3.4', 3, arr5121, {
                        4: is25
                    }],

                    [1, '5.3.10', 2, arr5122, {
                        3: is28
                    }],
                    [3, '5.3.11', 2, arr5122, {
                        3: equals('Εσωτερικό'),
                        4: is28
                    }],
                    [4, '5.3.11', 2, arr5122, {
                        3: equals('Εξωτερικό'),
                        4: is28
                    }],
                    [6, '5.3.12', 2, arr5122, {
                        3: is28
                    }],

                    [1, '5.3.1', 5, arr5123, {
                        3: equals('Υφιστάμενο Προσωπικό'),
                        7: is3
                    }],
                    [2, '5.3.1', 5, arr5123, {
                        3: equals('Νέο Προσωπικό'),
                        7: is3
                    }],
                    [3, '5.3.1', 5, arr5123, {
                        3: equals('Δελτίο Παροχής'),
                        7: is3
                    }],
                    [5, '5.3.2', 6, arr5123, {
                        2: equals('Εξοπλισμός'),
                        7: is3
                    }],
                    [6, '5.3.2', 6, arr5123, {
                        2: equals('Κτίριο'),
                        7: is3
                    }],
                    [8, '5.3.3', 3, arr5123, {
                        4: is3
                    }],
                    [9, '5.3.5', 3, arr5123, {
                        4: is3
                    }],
                    [10, '5.3.9', 2, arr5123, {
                        3: is3
                    }],
                    [12, '5.3.7', 2, arr5123, {
                        3: is3
                    }],
                    [13, '5.3.8', 2, arr5123, {
                        3: is3
                    }],
                    [14, '5.3.6', 2, arr5123, {
                        3: is3
                    }],
                    [15, '5.3.6.1', 2, arr5123, {
                        3: is3
                    }],
                    [17, '5.3.4', 3, arr5123, {
                        4: is3
                    }]
                ].map(function(el) {
                    el[3].find(sel(el[0], 2)).val(tableSumIf($('[data-alpaca-field-id="' + el[1] + '"]'), el[2], generateCondition(el[4])));
                });

            });
        },
        view: {
            parent: "bootstrap-edit-horizontal",
            wizard: {
                title: "Welcome to the Wizard",
                description: "Please fill things in as you wish",
                validation: false,
                markAllStepsVisited: true,
                hideSubmitButton: true,
                bindings: {
                    "tab1": 1,
                    "tab2": 2,
                    "tab3": 3,
                    "tab4": 4,
                    "tab5": 5,
                    "tab6": 6,
                    "tab7": 7,
                    "tab8": 8,
                    "tab9": 9,
                    "tab10": 10
                },
                steps: [{
                    title: "1",
                    description: "Γενικά"
                }, {
                    title: "2",
                    description: "Παρουσίαση"
                }, {
                    title: "3",
                    description: "Δικαιούχος"
                }, {
                    title: "4",
                    description: "Αναλυτικά",
                }, {
                    title: "5",
                    description: "Οικονομικά"
                }, {
                    title: "6",
                    description: "Ενσωμάτωση"
                }, {
                    title: "7",
                    description: "Άδειες"
                }, {
                    title: "8",
                    description: "Χρονοδιάγραμμα"
                }, {
                    title: "9",
                    description: "Δείκτες"
                }, {
                    title: "10",
                    description: "Δήλωση"
                }]
            }
        }
    });

    $("#download-btn").on('click', function() {
        var value = $("#form1").alpaca('get').getValue();
        this.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(JSON.stringify(value)));
        this.setAttribute('download', "Υποβολή" + $.format.date(new Date(), 'yyyy_M_d_H_mm_ss') + ".txt");
    });

    $('#advanced-download-link').on('click', function() {
        var value = $("#form1").alpaca('get').getValue();
        $('#submit-content').val(JSON.stringify(value));
    });

    $("#upload-file").on('change', function() {
        var file = this.files[0];
        if (file) {
            var reader = new FileReader();
            reader.readAsText(file, "UTF-8");
            reader.onload = function(evt) {
                $('#form1').empty();
                $("#form1").alpaca({
                    schemaSource: "./schema.json",
                    optionsSource: "./options.json",
                    view: "bootstrap-edit",
                    data: JSON.parse(evt.target.result)
                });
            };
            reader.onerror = function(evt) {};
        }
    });
});
