# alg.cubing.net

The new generation of alg/reconstruction viewing and sharing.  
Built on [`alg.js`](https://github.com/cubing/alg.js) and [`twisty.js`](https://github.com/cubing/twisty.js).

## Examples

- [Feliks Zemdegs' 4.73 world record](https://alg.cubing.net/?alg=x-_y-_%2F%2F_inspection%0AU-_R_F_R-_(U-_D)_%2F%2F_Xcross%0AL-_U2_L2_U-_L-_%2F%2F_2nd_%2F_3rd_pairs%0AU_R-_U2_R_U_R-_U-_R_%2F%2F_4th_pair%0AF_R_U-_R-_U-_R_U_R-_F-_%2F%2F_OLL(CP)%0AR_U-_R_U_R_U_R_U-_R-_U-_R2_U_%2F%2F_EPLL&setup=U2_F_L2_U2_R2_F_L2_F2_L-_D-_B2_R_D2_R-_B-_U-_L-_B-&type=reconstruction&view=playback&title=Feliks%20Zemdegs,%204.73%20WR)
- [T-perm](https://alg.cubing.net/?title=T-Perm&alg=R_U_R-_U-_R-_F_R2_U-_R-_U-_R_U_R-_F-&stage=PLL&type=alg&view=fullscreen) (fullscreen)
- [Notation Stress Test](https://alg.cubing.net/?alg=RLUDBF_%2F%2F_Single_moves,_no_space.%0AB-_F-_D-_U-_L-_R-_%2F%2F_Inverses.%0AR_L2_R3_L2-_R5_L8-_R7_%2F%2F_Move_amount%0AU_._U_._U_._U_%2F%2F_Pauses.%0AM-_E2_S2_M_S2_E2_%2F%2F_Slice_turns.%0AM2-_U-_M2-_U2-_M2-_U-_M2-_%2F%2F_H-perm.%0Ax_y_z_%2F%2F_Rotations.%0AR2_L2_R2-_L2-_%2F%2F_Half_turns.%0ARw_r-_%2F%2F_Wide_turns.%0A4Rw_x_L-_%2F%2F_Very_wide_turns%0A2%26%2345%3B3Lw_3%26%2345%3B4r__%2F%2F_Wide_block_turns&ini=M2_U_M2_U2_M2_U_M2&name=twisty.js_Stress_Test&cube=5x5x5&setup=M2_U_M2_U2_M2_U_M2&puzzle=5x5x5&title=Stress%20Test)

## Goals

- Solid desktop and mobile support.
- Beautiful alg/reconstruction playback.
- Convenient alg/reconstruction input (i.e. Heise input, live feedback).
- Support for all official puzzles, and popular unofficial ones.
- Simultaneous development with [twisty.js](https://github.com/cubing/twisty.js):
  - Replacement for Java twistypuzzle applets (Heise/Randelshofer/Jelinek/Petrus).
  - State-of-the-art alg parsing and transformation/calculation.
  - General extensibility/hackability, but hopefully all contributed back in one place for everyone to use.
    - Few dependencies.

## History

- [cube.garron.us/tools/index.htm](http://cube.garron.us/tools/index.htm)
  - Firefox search engine.
  - Announced [in the speedsolvingrubikscube Yahoo! group](https://groups.yahoo.com/neo/groups/speedsolvingrubikscube/conversations/topics/36618) on June 25, 2007.
- [cube.garron.us/applets/SiGN_test.htm](http://cube.garron.us/applets/SiGN_test.htm)
- [alg.garron.us/SiGN_test.htm](http://alg.garron.us/SiGN_test.htm)
  - This is actually *still* the source that is served from [alg.garron.us](http://alg.garron.us/)
- [alg.garron.us](http://alg.garron.us/)
  - Announced [at speedsolving.com](http://www.speedsolving.com/forum/showthread.php?10719-alg-garron-us) on March 25, 2009.
  - Receiving about 1 hit per minute as of early 2014.
- [twisty.js](https://github.com/cubing/twisty.js)
  - Started at a hackathon in June 2011, with the goal of providing a Javascript-only alternative to existing cube applets.
- [alg.cubing.net](http://alg.cubing.net/)
  - Under development. Eventually, all [alg.garron.us](http://alg.garron.us/)  traffic will be redirected here.
