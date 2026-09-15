I need to relate j, which is the x position of the line, to the gaussian distribution.

Somehow multiple dists, lets say 3, must increase in significance as we get closer to 
3 random points, but until we get to those points, it should be near 0. How do you do that? lets say the
random point is 260. j / 260 would be 0 at the start, then would be nearly half at the halfway point, then 1 at the full point, but then after 1 we need to subtract the point. E.g. 340 / 260 ~~ 1.31, so we would do 340 / 260 - (Math.trunc(340 / 260 - 340 // 260).
nevermind. 

```js
function smooth(x, target) {
    let ratio = (x % target) / target;
    return (ratio - Math.trunc(ratio))*2
}

```

Best i got before asking codex.

Alright you're up to adding sliders to change settings in real time as you view the page. Perlin noise strength changing is done, but you need to handle the settings that change the line generation, because you're technically