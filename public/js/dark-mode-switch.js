//No Content: https://designing-world.com/suha-v2.6.0/js/dark-mode-switch.js

$(function() {
    
    const setTheme = (theme) => {
        const getCookies = document.cookie.split(';');
        let getDataTheme;

        getCookies.forEach(pair => {
            const [key, value] = pair.split("=");
            if (key == 'data-theme') {
                console.log(getCookies);
            }
        });
    }

    $("#darkSwitch").on('change', function(){
        setTheme()
        console.log('Theme');
        $("html").attr("data-theme", $("html").attr("data-theme") == "light" ? "dark" : "light");
    });
}); 


