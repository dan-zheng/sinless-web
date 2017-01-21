$(document).ready(function() {
    var chart = c3.generate({
        bindto: '#chart',
        data: {
            columns: [
                ["limit", 3, 3, 3, 3, 3, 3],
                ['swears', 2, 3, 5, 1, 3, 2]
            ],
            types: {
                limit: 'line',
                swears: 'area-spline' // 'line', 'spline', 'step', 'area', 'area-step' are also available to stack
            },
            colors: {
                limit: '#d62728',
                swears: '#ff7f0e'
            },
        }
    });
});
